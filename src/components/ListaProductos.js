import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, TextInput, View, StyleSheet, Modal as RNModal, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera"; // Importar escáner
import Ionicons from "@expo/vector-icons/Ionicons";

// ... tus otros imports
import Product from "@db/Product";
import ProductLista from "@db/ProductLista";
import Configuration from "@db/Configuration";
import { useCart } from "../hooks/useCart";
import Colors from "../styles/Colors";
import { getFontSize } from "../utils/Metrics";
import FooterTotal from "./Cart/FooterTotal";
import ItemCart from "./Cart/ItemCart";
import ModalItem from "./Cart/ModalItem";

export default function ListaProductos({ priceClassSelected = 1, lista = '', scanTrigger = 0, searchTrigger = 0, searchCode = "", searchQuantity = 1, autoAddOnManualSearch = false, hideList = false, autoAddOnScan = false, scanQuantity = 1, onAutoAdd, showSearchCamera = true, searchAutoFocus = true, fillHeight = true, showFooter = true, listCompact = false, isActive = true, darkMode = false }) {
    const { passValidations, addManyToCart, noPermiteDuplicarItem, cartItems } = useCart();
    const effectivePriceClass = priceClassSelected || 1;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pendingSelected, setPendingSelected] = useState(null);
    const [manualSelectedQty, setManualSelectedQty] = useState(null);
    
    // Estados para el Escáner
    const [permission, requestPermission] = useCameraPermissions();
    const [scannerVisible, setScannerVisible] = useState(false);

    const [productSearchText, setProductSearchText] = useState("");
    const [productsSearch, setProductsSearch] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [item, setItem] = useState(null);
    const [defaultProducts, setDefaultProducts] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [pendingScans, setPendingScans] = useState([]);
    const [scanModalVisible, setScanModalVisible] = useState(false);
    const [scannedCode, setScannedCode] = useState("");
    const [scannedQty, setScannedQty] = useState("1");
    const [scannedLookupCode, setScannedLookupCode] = useState("");
    const [CfgCodPesable, setCfgCodPesable] = useState("");
    const [cfgDecimalesEan, setCfgDecimalesEan] = useState(0);
    const loadingRef = useRef(false);
    const lastSearchTriggerRef = useRef(0);
    const lastScanTriggerRef = useRef(0);

    const refInput = useRef();
    const scanningRef = useRef(false);
    const normalize = (c) => String(c ?? "").replace(/[^0-9a-z]/gi, "");
    const promoteProduct = (product) => {
        if (!product) return;
        setProductsSearch((prev) => {
            if (!Array.isArray(prev) || prev.length === 0) return prev;
            const filtered = prev.filter((p) => p?.id !== product?.id);
            return [product, ...filtered];
        });
        setDefaultProducts((prev) => {
            if (!Array.isArray(prev) || prev.length === 0) return prev;
            const filtered = prev.filter((p) => p?.id !== product?.id);
            return [product, ...filtered];
        });
    };
    const withTimeout = async (promise, label = "consulta", ms = 6000) => {
        let timer;
        try {
            return await Promise.race([
                promise,
                new Promise((_, reject) => {
                    timer = setTimeout(() => reject(new Error(`Timeout en ${label}`)), ms);
                })
            ]);
        } finally {
            if (timer) clearTimeout(timer);
        }
    };

    // 1. Solicitar permisos de cámara
    useEffect(() => {
        const init = async () => {
            try {
                await withTimeout(Product.createTable(), "createTable(products)", 4000);
                if (lista) {
                    await withTimeout(ProductLista.createTable(), "createTable(products_listas)", 4000);
                }
                await withTimeout(Product.ensureIndexes(), "ensureIndexes", 4000);
                const codPesableCfg = await withTimeout(Configuration.getConfigValue("CfgCodPesable"), "getConfigValue(CfgCodPesable)", 4000);
                const codPesableLegacy = await withTimeout(Configuration.getConfigValue("CodPesable"), "getConfigValue(CodPesable)", 4000);
                const decimalesCfg = await withTimeout(Configuration.getConfigValue("cfgDecimalesEan"), "getConfigValue(cfgDecimalesEan)", 4000);
                const decimalesLegacy = await withTimeout(Configuration.getConfigValue("DecimalesEan"), "getConfigValue(DecimalesEan)", 4000);
                const codPesable = codPesableCfg || codPesableLegacy;
                const decimalesEan = decimalesCfg || decimalesLegacy;
                setCfgCodPesable(String(codPesable ?? "").trim().toUpperCase());
                setCfgDecimalesEan(Math.max(0, parseInt(decimalesEan, 10) || 0));
            } catch (e) {
                // seguimos igual para no bloquear la UI
            }
            setDefaultProducts([]);
            loadProducts("");
        };
        init();
    }, [effectivePriceClass, lista]);

    const getWeightedQuantityFromScan = (mode, decimals, rawValue, product) => {
        const value = parseInt(String(rawValue ?? ""), 10);
        if (!Number.isFinite(value)) return null;
        const divisor = Math.pow(10, Math.max(0, decimals || 0));
        const parsedValue = divisor > 0 ? value / divisor : value;

        if (mode === "P" || mode === "Q") {
            return parsedValue;
        }

        if (mode === "T") {
            const unitPrice = parseFloat(product?.[`price${effectivePriceClass}`] ?? 0);
            if (!unitPrice) return null;
            return parsedValue / unitPrice;
        }

        return null;
    };

    const parseWeightedCodeByMask = (rawCode) => {
        let code = String(rawCode ?? "").trim();
        const mask = String(CfgCodPesable ?? "").trim().toUpperCase();
        if (mask && code.length === mask.length && mask.startsWith("0")) {
            code = `0${code}`;
            console.log("[EAN] normalizado UPC/EAN", { rawCode, normalizedCode: code, mask });
        } else if (mask && code.length === mask.length - 1 && mask.startsWith("0") && !code.startsWith("0")) {
            code = `0${code}`;
            console.log("[EAN] normalizado con cero inicial", { rawCode, normalizedCode: code, mask });
        }
        if (!code || !mask || code.length < mask.length) {
            console.log("[EAN] invalido", { code, mask });
            return null;
        }

        const maskedCode = code.slice(0, mask.length);

        let lookupCode = "";
        let valueDigits = "";
        let valueMode = "";

        for (let i = 0; i < mask.length; i++) {
            const maskChar = mask[i];
            const codeChar = maskedCode[i];

            if (["C", "P", "Q", "T"].includes(maskChar)) {
                if (maskChar === "C") {
                    lookupCode += codeChar;
                } else {
                    valueDigits += codeChar;
                    if (!valueMode) {
                        valueMode = maskChar;
                    }
                }
                continue;
            }

            if (maskChar !== codeChar) {
                console.log("[EAN] no coincide mascara", { code, mask, pos: i, esperado: maskChar, recibido: codeChar });
                return null;
            }
        }

        if (!lookupCode) {
            console.log("[EAN] sin codigo articulo", { code, mask });
            return null;
        }

        if (mask === "0CCCCCPPPPPP") {
            const specialParsed = {
                lookupCode: maskedCode.slice(1, 6),
                valueDigits: maskedCode.slice(6, 12),
                valueMode: "P",
                forceDivisor: 1000,
            };
            console.log("[EAN] parse especial", { code, mask, ...specialParsed });
            return specialParsed;
        }

        const parsed = {
            lookupCode,
            valueDigits,
            valueMode,
        };
        console.log("[EAN] parse", { code, mask, lookupCode, valueDigits, valueMode });
        return parsed;
    };

    const resolveScannedProduct = async (code, useFallback = true) => {
        let product = await findProductByCode(code, useFallback);
        if (product && product.length > 0) {
            console.log("[EAN] match directo", { scanned: code, found: product[0]?.code });
            return { products: product, qtyOverride: null, lookupCode: code };
        }

        const rawCode = String(code ?? "").trim();
        const parsed = parseWeightedCodeByMask(rawCode);
        if (!parsed) {
            console.log("[EAN] no parseado como pesable", { scanned: rawCode, cfg: CfgCodPesable, decimales: cfgDecimalesEan });
            return { products: [], qtyOverride: null, lookupCode: code };
        }

        let candidates = await withTimeout(Product.findByCode(parsed.lookupCode, lista), "findByCode(mask)", 12000);
        if ((!candidates || candidates.length === 0) && lista) {
            candidates = await withTimeout(Product.findByCode(parsed.lookupCode, ""), "findByCode(mask)", 12000);
        }
        if (!candidates || candidates.length === 0) {
            console.log("[EAN] articulo no encontrado", { scanned: rawCode, lookupCode: parsed.lookupCode, lista });
            return { products: [], qtyOverride: null, lookupCode: code };
        }

        const selected = candidates[0];
        const qtyOverride = parsed.forceDivisor
            ? (parseInt(String(parsed.valueDigits ?? ""), 10) || 0) / parsed.forceDivisor
            : getWeightedQuantityFromScan(parsed.valueMode, cfgDecimalesEan, parsed.valueDigits, selected);
        console.log("[EAN] resuelto", {
            scanned: rawCode,
            lookupCode: parsed.lookupCode,
            mode: parsed.valueMode,
            valueDigits: parsed.valueDigits,
            decimales: cfgDecimalesEan,
            forceDivisor: parsed.forceDivisor || null,
            qtyOverride,
            product: selected?.code,
        });

        return {
            products: [selected],
            qtyOverride: qtyOverride && qtyOverride > 0 ? qtyOverride : null,
            lookupCode: parsed.lookupCode,
        };
    };

    // 2. Función unificada de búsqueda por código (para Enter y para Escáner)
    const findProductByCode = async (code, useFallback = true) => {
        // Intentamos buscar por codigoBarras primero o code
        let product = await withTimeout(Product.findByCode(code, lista), "findByCode", 12000);
        if ((!product || product.length === 0) && lista) {
            product = await withTimeout(Product.findByCode(code, ""), "findByCode", 12000);
        }
        if (useFallback && (!product || product.length === 0) && code) {
            const raw = String(code ?? "").trim();
            const isNumeric = /^[0-9]+$/.test(raw);
            if (isNumeric) {
                product = await withTimeout(Product.findLikeName(raw, effectivePriceClass, 1, lista), "findLikeName");
                if ((!product || product.length === 0) && lista) {
                    product = await withTimeout(Product.findLikeName(raw, effectivePriceClass, 1, ""), "findLikeName");
                }
            }
        }
        return product;
    };

    const searchByCode = async (code, useFallback = true, manualQty = null) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setIsLoading(true);
        try {
            const rawCode = String(code ?? "").trim();
            const isPendingSelection =
                pendingSelected && normalize(pendingSelected.code) === normalize(rawCode);
            const localList = [...(productsSearch || []), ...(defaultProducts || [])];
            const localMatch = localList.find((p) => {
                const normalizedRawCode = normalize(rawCode);
                return [
                    p?.code,
                    p?.codigoBarras,
                    p?.codigoBarra1,
                    p?.codigoBarra2,
                    p?.codigoBarra3,
                    p?.codigoBarra4,
                    p?.codigoBarraDun,
                ].some((value) => normalize(value) === normalizedRawCode);
            });
            const effectiveQty = manualQty || manualSelectedQty;
            if (localMatch) {
                if (autoAddOnManualSearch && effectiveQty) {
                    const validate = await passValidations(localMatch);
                    if (!validate) {
                        Alert.alert('Alerta', 'Este artículo ya fue cargado en este o en otro comprobante.');
                        resetSearch(false);
                        return;
                    }
                    addManyToCart([{ product: localMatch, qty: effectiveQty }]);
                    if (typeof onAutoAdd === "function") {
                        onAutoAdd(localMatch, effectiveQty);
                    }
                    promoteProduct(localMatch);
                    resetSearch(false);
                    return;
                }
                setItem(localMatch);
                setProductSearchText("");
                setProductsSearch(defaultProducts || []);
                setIsModalVisible(true);
                return;
            }
            const resolved = await resolveScannedProduct(code, useFallback);
            const product = resolved.products;
            if (product && product.length > 0) {
                const selected = product[0];
                const validate = await passValidations(selected);

                if (!validate) {
                    Alert.alert('Alerta', 'Este artículo ya fue cargado en este o en otro comprobante.');
                    resetSearch(false);
                    return;
                }

                const finalQty = resolved.qtyOverride ?? effectiveQty;
                if (autoAddOnManualSearch && finalQty) {
                    addManyToCart([{ product: selected, qty: finalQty }]);
                    if (typeof onAutoAdd === "function") {
                        onAutoAdd(selected, finalQty);
                    }
                    promoteProduct(selected);
                    resetSearch(false);
                    return;
                }
                setItem(selected);
                setProductSearchText("");
                setProductsSearch(defaultProducts || []);
                setIsModalVisible(true);
            } else {
                const msg = isPendingSelection
                    ? 'El código no existe. Podés volver a escanear o reintentar.'
                    : 'El código escaneado no existe.';
                Alert.alert(
                    'Error',
                    msg,
                    isPendingSelection
                        ? [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                                text: 'Reintentar',
                                onPress: () => {
                                    if (pendingSelected) {
                                        setPendingScans((prev) =>
                                            prev.filter((p) => normalize(p.code) !== normalize(pendingSelected.code))
                                        );
                                        setPendingSelected(null);
                                    }
                                    openScanner();
                                },
                            },
                        ]
                        : [{ text: 'OK' }]
                );
            }
        } catch (e) {
            const rawCode = String(code ?? "").trim();
            const isPendingSelection =
                pendingSelected && normalize(pendingSelected.code) === normalize(rawCode);
            const msg = isPendingSelection
                ? 'No se pudo buscar el código. Podés reintentar.'
                : (e?.message || 'No se pudo buscar el artículo.');
            Alert.alert(
                'Error',
                msg,
                isPendingSelection
                    ? [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                            text: 'Reintentar',
                            onPress: () => {
                                if (pendingSelected) {
                                    setPendingScans((prev) =>
                                        prev.filter((p) => normalize(p.code) !== normalize(pendingSelected.code))
                                    );
                                    setPendingSelected(null);
                                }
                                openScanner();
                            },
                        },
                    ]
                    : [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
            loadingRef.current = false;
        }
    };

    const resetSearch = (focusSearch = true) => {
        setProductSearchText("");
        setProductsSearch(defaultProducts || []);
        if (focusSearch && refInput.current) refInput.current.focus();
    };

    const handleBarCodeScanned = async ({ type, data }) => {
        if (!data) return;
        const code = String(data).trim();
        if (!code) return;
        setScannerVisible(false);

        if (autoAddOnScan) {
            try {
                const resolved = await resolveScannedProduct(code, true);
                const product = resolved.products;
                const qty = resolved.qtyOverride ?? (Number.isFinite(parseFloat(scanQuantity)) && parseFloat(scanQuantity) > 0
                    ? parseFloat(scanQuantity)
                    : 1);
                if (product && product.length > 0) {
                    const validate = await passValidations(product[0]);
                    if (!validate) {
                        Alert.alert('Alerta', 'Este artículo ya fue cargado en este o en otro comprobante.');
                        return;
                    }
                    addManyToCart([{ product: product[0], qty, separateLine: true }]);
                    if (typeof onAutoAdd === "function") {
                        onAutoAdd(product[0], qty);
                    }
                    promoteProduct(product[0]);
                    return;
                }
                Alert.alert('Error', 'El código escaneado no existe.');
            } catch (e) {
                Alert.alert('Error', e?.message || 'No se pudo buscar el artículo.');
            }
            return;
        }

        setScannedCode(code);
        const resolved = await resolveScannedProduct(code, true);
        setScannedQty(String(resolved.qtyOverride ?? 1));
        setScannedLookupCode(String(resolved.lookupCode ?? code));
        setScanModalVisible(true);
    };

    const addPendingScan = () => {
        const code = String(scannedCode ?? "").trim();
        if (!code) {
            Alert.alert("Error", "Código inválido.");
            return;
        }
        const qty = parseFloat(String(scannedQty ?? "").replace(",", "."));
        const normalizedQty = Number.isFinite(qty) && qty > 0 ? qty : 0;
        if (!normalizedQty) {
            Alert.alert("Error", "Ingrese una cantidad válida.");
            return;
        }
        setPendingScans((prev) => {
            const existing = prev.find((p) => p.code === code);
            if (existing) {
                return prev.map((p) => p.code === code ? { ...p, qty: p.qty + normalizedQty } : p);
            }
            return [{ code, lookupCode: scannedLookupCode || code, qty: normalizedQty, separateLine: true }, ...prev];
        });
        setScanModalVisible(false);
        setScannedLookupCode("");
    };

    const validatePendingScans = async () => {
        if (scanningRef.current || pendingScans.length === 0) return;
        if (loadingRef.current) return;
        loadingRef.current = true;
        scanningRef.current = true;
        setIsLoading(true);
        try {
            const t0 = Date.now();
            console.log("[SCAN][process] start", pendingScans.length);
            const codes = pendingScans.map(p => p.lookupCode || p.code);
            const t1 = Date.now();
            let rows = await withTimeout(Product.findByCodes(codes, lista), "findByCodes", 8000);
            if ((!rows || rows.length === 0) && lista) {
                rows = await withTimeout(Product.findByCodes(codes, ""), "findByCodes", 8000);
            }
            if (!rows) {
                rows = [];
            }
            console.log("[SCAN][process] findByCodes(ms)", Date.now() - t1, "rows", (rows || []).length);

            const normalize = (c) => String(c ?? "").replace(/[^0-9a-z]/gi, "");
            const map = new Map();
            (rows || []).forEach((r) => {
                [
                    r.code,
                    r.codigoBarras,
                    r.codigoBarra1,
                    r.codigoBarra2,
                    r.codigoBarra3,
                    r.codigoBarra4,
                    r.codigoBarraDun,
                ].forEach((value) => {
                    if (value) {
                        map.set(normalize(value), r);
                    }
                });
            });

            let missing = [];
            let duplicated = [];
            let cartSet = new Set((cartItems || []).map(i => String(i.code)));
            let toAdd = [];
            for (const scan of pendingScans) {
                const key = normalize(scan.lookupCode || scan.code);
                const product = map.get(key);
                if (product) {
                    if (noPermiteDuplicarItem && cartSet.has(String(product.code))) {
                        duplicated.push(scan.code);
                    } else {
                        toAdd.push({ product, qty: scan.qty, separateLine: scan.separateLine === true });
                    }
                } else {
                    missing.push(scan.code);
                }
            }

            if (toAdd.length > 0) {
                const t2 = Date.now();
                addManyToCart(toAdd);
                console.log("[SCAN][process] addManyToCart(ms)", Date.now() - t2, "items", toAdd.length);
            }

            // Si falló la búsqueda masiva, procesamos uno por uno y vamos quitando pendientes
            if ((rows || []).length === 0 && pendingScans.length > 0) {
                missing = [];
                duplicated = [];
                const remaining = [];
                for (const scan of pendingScans) {
                    try {
                        let one = await withTimeout(Product.findByCode(scan.lookupCode || scan.code, lista), "findByCode", 5000);
                        if ((!one || one.length === 0) && lista) {
                            one = await withTimeout(Product.findByCode(scan.lookupCode || scan.code, ""), "findByCode", 5000);
                        }
                        const product = one && one.length > 0 ? one[0] : null;
                        if (!product) {
                            missing.push(scan.code);
                            remaining.push(scan);
                            continue;
                        }
                        if (noPermiteDuplicarItem && cartSet.has(String(product.code))) {
                            duplicated.push(scan.code);
                            continue;
                        }
                        addManyToCart([{ product, qty: scan.qty, separateLine: scan.separateLine === true }]);
                        cartSet.add(String(product.code));
                    } catch (e) {
                        remaining.push(scan);
                    }
                }
                setPendingScans(remaining);
            } else {
                setPendingScans([]);
            }
            console.log("[SCAN][process] total(ms)", Date.now() - t0);
            if (missing.length > 0) {
                const msg = `No existen: ${missing.join(", ")}. Podés reintentar la búsqueda.`;
                Alert.alert("No existen", msg, [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Reintentar",
                        onPress: () => {
                            const missingSet = new Set(missing.map((m) => normalize(m)));
                            setPendingScans((prev) => prev.filter((p) => !missingSet.has(normalize(p.code))));
                            openScanner();
                        },
                    },
                ]);
            }
            if (duplicated.length > 0) {
                Alert.alert("Aviso", `Ya cargados: ${duplicated.join(", ")}`);
            }
        } catch (e) {
            Alert.alert("Error", e?.message || "No se pudieron validar los artículos.");
        } finally {
            setIsLoading(false);
            scanningRef.current = false;
            loadingRef.current = false;
        }
    };

    const ensureCameraPermission = async () => {
        if (permission?.granted) return true;
        const result = await requestPermission();
        if (result?.granted) return true;
        const message = result?.canAskAgain
            ? "Debes permitir el acceso a la cámara para escanear."
            : "Permiso de cámara denegado. Habilitalo desde los ajustes.";
        Alert.alert("Sin acceso", message);
        return false;
    };

    const openScanner = async () => {
        if (await ensureCameraPermission()) {
            setScannerVisible(true);
        }
    };

    useEffect(() => {
        if (!isActive) return;
        if (scanTrigger <= 0 || scanTrigger === lastScanTriggerRef.current) {
            return;
        }
        lastScanTriggerRef.current = scanTrigger;
        openScanner();
    }, [scanTrigger, isActive]);

    useEffect(() => {
        if (!isActive) {
            setScannerVisible(false);
        }
    }, [isActive]);

    useEffect(() => {
        if (searchTrigger <= 0 || searchTrigger === lastSearchTriggerRef.current) {
            return;
        }
        lastSearchTriggerRef.current = searchTrigger;
        const code = String(searchCode ?? "").trim();
        if (code) {
            const qty = parseInt(searchQuantity, 10);
            const normalizedQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
            setManualSelectedQty(normalizedQty);
            searchByCode(code, true, normalizedQty);
        }
    }, [searchTrigger, searchCode, searchQuantity]);

    useEffect(() => {
        if (!isModalVisible) {
            setManualSelectedQty(null);
        }
    }, [isModalVisible]);

    const loadProducts = async (text = "") => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setIsLoading(true);
        setProductSearchText(text);
        try {
            // Respuesta rápida con cache
            if (text == "" && defaultProducts && defaultProducts.length > 0) {
                setProductsSearch(defaultProducts);
            }
            let products = [];

            if (text == "") {
                if (lista) {
                    products = await withTimeout(Product.findLikeName("", effectivePriceClass, 20, lista), "findLikeName");
                    if (!products || products.length === 0) {
                        products = await withTimeout(Product.query({ limit: 20, page: 1 }), "query");
                    }
                } else {
                    products = await withTimeout(Product.query({ limit: 20, page: 1 }), "query");
                }
                if (!defaultProducts || defaultProducts.length === 0) setDefaultProducts(products || []);
            } else {
                const raw = String(text ?? "").trim();
                const isNumeric = /^[0-9]+$/.test(raw);
                if (isNumeric && raw.length >= 4) {
                    const byCode = await withTimeout(Product.findByCode(raw, lista), "findByCode");
                    if (byCode && byCode.length > 0) {
                        products = byCode;
                    } else {
                        products = await withTimeout(Product.findLikeName(raw, effectivePriceClass, 10, lista), "findLikeName");
                        if ((!products || products.length === 0) && lista) {
                            products = await withTimeout(Product.findLikeName(raw, effectivePriceClass, 10, ""), "findLikeName");
                        }
                    }
                } else {
                    products = await withTimeout(Product.findLikeName(raw, effectivePriceClass, 10, lista), "findLikeName");
                    if ((!products || products.length === 0) && lista) {
                        products = await withTimeout(Product.findLikeName(raw, effectivePriceClass, 10, ""), "findLikeName");
                    }
                }
            }

            setProductsSearch(Array.isArray(products) ? products : []);
        } catch (e) {
            // Si falla, reiniciamos la pantalla completa
            setProductsSearch([]);
            setProductSearchText("");
            setDefaultProducts([]);
            setRefreshKey((k) => k + 1);
            setTimeout(() => {
                loadProducts("");
            }, 0);
        } finally {
            setIsLoading(false);
            loadingRef.current = false;
        }
    };

    const rootStyle = hideList ? null : (fillHeight ? { height: "100%" } : null);

    return (
        <View style={rootStyle} key={refreshKey}>
            <ModalItem
                isNew={true}
                isVisible={isModalVisible}
                setIsVisible={setIsModalVisible}
                item={item}
                darkMode={darkMode}
                initialQuantity={
                    manualSelectedQty
                        ? manualSelectedQty
                        : pendingSelected && (
                            normalize(pendingSelected.code) === normalize(item?.code) ||
                            normalize(pendingSelected.code) === normalize(item?.codigoBarras) ||
                            normalize(pendingSelected.code) === normalize(item?.codigoBarra1) ||
                            normalize(pendingSelected.code) === normalize(item?.codigoBarra2) ||
                            normalize(pendingSelected.code) === normalize(item?.codigoBarra3) ||
                            normalize(pendingSelected.code) === normalize(item?.codigoBarra4) ||
                            normalize(pendingSelected.code) === normalize(item?.codigoBarraDun)
                        )
                            ? pendingSelected.qty
                            : null
                }
                onAdded={() => {
                    setManualSelectedQty(null);
                    if (pendingSelected && item) {
                        const match =
                            normalize(pendingSelected.code) === normalize(item.code) ||
                            normalize(pendingSelected.code) === normalize(item.codigoBarras) ||
                            normalize(pendingSelected.code) === normalize(item.codigoBarra1) ||
                            normalize(pendingSelected.code) === normalize(item.codigoBarra2) ||
                            normalize(pendingSelected.code) === normalize(item.codigoBarra3) ||
                            normalize(pendingSelected.code) === normalize(item.codigoBarra4) ||
                            normalize(pendingSelected.code) === normalize(item.codigoBarraDun);
                        if (match) {
                            setPendingScans((prev) => prev.filter((p) => normalize(p.code) !== normalize(pendingSelected.code)));
                        }
                        setPendingSelected(null);
                    }
                }}
            />

            {/* Modal de la Cámara */}
            <RNModal visible={scannerVisible} animationType="slide">
                <View style={styles.scannerContainer}>
                    <CameraView
                        onBarcodeScanned={scannerVisible ? handleBarCodeScanned : undefined}
                        barcodeScannerSettings={{
                            barcodeTypes: ["ean13", "ean8", "code128", "code39", "code93", "qr"],
                        }}
                        style={StyleSheet.absoluteFillObject}
                    />
                    <View style={styles.overlay}>
                        <Text style={styles.scanText}>Encuadre el codigo de barras</Text>
                        <TouchableOpacity 
                            onPress={() => {
                                scanningRef.current = false;
                                setScannerVisible(false);
                            }} 
                            style={styles.closeButton}
                        >
                            <Text style={{ color: 'white' }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </RNModal>
            <RNModal visible={scanModalVisible} animationType="fade" transparent={true}>
                <View style={styles.scanModalBackdrop}>
                    <View style={styles.scanModalCard}>
                        <Text style={styles.scanTitle}>Código escaneado</Text>
                        <Text style={styles.scanCode}>{scannedCode}</Text>
                        <Text style={styles.scanLabel}>Cantidad</Text>
                        <TextInput
                            value={scannedQty}
                            onChangeText={setScannedQty}
                            keyboardType="number-pad"
                            style={styles.scanInput}
                        />
                        <TouchableOpacity style={styles.scanPrimaryBtn} onPress={addPendingScan}>
                            <Text style={styles.scanPrimaryBtnText}>Agregar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.scanSecondaryBtn} onPress={() => setScanModalVisible(false)}>
                            <Text style={styles.scanSecondaryBtnText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </RNModal>

            {!hideList && (
                <>
                    <View style={[styles.searchContainer, darkMode && styles.searchContainerDark]}>
                        <TextInput
                            ref={refInput}
                            autoFocus={searchAutoFocus}
                            style={{ marginVertical: 10, width: "75%", padding: 10, color: darkMode ? "#E8F0F8" : "#1B1B1B" }}
                            placeholder="Descripcion o codigo"
                            placeholderTextColor={darkMode ? "#9CB2C8" : "#7A7A7A"}
                            onChangeText={(text) => loadProducts(text)}
                            onSubmitEditing={() => searchByCode(productSearchText)}
                            value={productSearchText}
                            clearButtonMode="always"
                        />

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            {productSearchText?.length > 0 && (
                                <TouchableOpacity onPress={() => loadProducts("")} style={styles.clearBtn}>
                                    <Text style={{ color: darkMode ? "#E8F0F8" : "#1B1B1B" }}>X</Text>
                                </TouchableOpacity>
                            )}
                            
                            {/* Botón para abrir cámara */}
                            {showSearchCamera && (
                                <TouchableOpacity 
                                    onPress={async () => {
                                        if (await ensureCameraPermission()) {
                                            setScannerVisible(true);
                                        }
                                    }} 
                                    style={styles.cameraBtn}
                                >
                                     <Ionicons name="camera-outline" size={22} color={darkMode ? "#8FC3FF" : Colors.DBLUE} /> 
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    {pendingScans.length > 0 && (
                        <View style={{ paddingHorizontal: 10, marginBottom: 10 }}>
                            <Text style={{ fontSize: getFontSize(14), marginBottom: 6, color: darkMode ? "#E8F0F8" : "#1B1B1B" }}>Pendientes: {pendingScans.length}</Text>
                            <View style={{ backgroundColor: darkMode ? "#152332" : "#f7f7f7", borderWidth: 1, borderColor: darkMode ? "#2D4154" : Colors.GREY, borderRadius: 6, padding: 8 }}>
                                {pendingScans.map((p, idx) => (
                                    <TouchableOpacity
                                        key={`${p.code}_${idx}`}
                                        style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}
                                        onPress={() => {
                                            setPendingSelected({ code: p.code, qty: p.qty });
                                            searchByCode(p.code, true);
                                        }}
                                    >
                                        <Text style={{ color: darkMode ? "#E8F0F8" : "#1B1B1B" }}>{p.code}</Text>
                                        <Text style={{ color: darkMode ? "#E8F0F8" : "#1B1B1B" }}>x {p.qty}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TouchableOpacity onPress={validatePendingScans} style={{ backgroundColor: Colors.DBLUE, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, marginTop: 8 }}>
                                <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>Procesar</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {isLoading && <ActivityIndicator size="large" color={darkMode ? "#8FC3FF" : Colors.MAIN} />}

                    {(!isLoading && Array.isArray(productsSearch) && productsSearch.length > 0) && (
                        <FlatList
                            style={{ backgroundColor: darkMode ? "#0F1720" : "#ececec", paddingHorizontal: 10 }}
                            data={productsSearch}
                            keyExtractor={(item) => item.id + ""}
                            renderItem={({ item }) => (
                                <ItemCart
                                    priceClass={priceClassSelected}
                                    item={item}
                                    showImage={!listCompact}
                                    compact={listCompact}
                                    darkMode={darkMode}
                                />
                            )}
                        />
                    )}
                    {(!isLoading && Array.isArray(productsSearch) && productsSearch.length === 0) && (
                        <View style={{ alignItems: "center", marginTop: 20 }}>
                            <Text style={{ color: darkMode ? "#9CB2C8" : Colors.GREY }}>No hay articulos para mostrar.</Text>
                            <TouchableOpacity onPress={() => loadProducts("")} style={{ marginTop: 10 }}>
                                <Text style={{ color: darkMode ? "#8FC3FF" : Colors.DBLUE, fontWeight: "600" }}>Reintentar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {showFooter && <FooterTotal darkMode={darkMode} />}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        width: "100%", 
        flexDirection: "row", 
        marginBottom: 10, 
        borderWidth: 1, 
        borderColor: Colors.GREY, 
        backgroundColor: Colors.WHITE, 
        alignItems: "center", 
        justifyContent: "space-between",
        paddingHorizontal: 10
    },
    searchContainerDark: {
        borderColor: "#2D4154",
        backgroundColor: "#152332",
    },
    cameraBtn: {
        backgroundColor: 'transparent',
        padding: 8,
        borderRadius: 5,
    },
    clearBtn: {
        backgroundColor: Colors.GREY,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
        width: 25,
        height: 25
    },
    scannerContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    overlay: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    scanText: {
        color: 'white',
        fontSize: 18,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        marginBottom: 20
    },
    closeButton: {
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 10
    },
    scanModalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        justifyContent: "center",
        alignItems: "center"
    },
    scanModalCard: {
        width: "86%",
        backgroundColor: "white",
        paddingVertical: 18,
        paddingHorizontal: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e9e9e9"
    },
    scanTitle: {
        fontSize: getFontSize(16),
        fontWeight: "700",
        color: "#1f2937",
        marginBottom: 6
    },
    scanCode: {
        fontSize: getFontSize(20),
        fontWeight: "600",
        color: "#111827",
        marginBottom: 14
    },
    scanLabel: {
        fontSize: getFontSize(13),
        color: "#6b7280",
        marginBottom: 6
    },
    scanInput: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        fontSize: getFontSize(16),
        color: "#111827",
        marginBottom: 14,
        backgroundColor: "#fafafa"
    },
    scanPrimaryBtn: {
        backgroundColor: Colors.GREEN,
        paddingVertical: 12,
        borderRadius: 14,
        marginBottom: 10
    },
    scanPrimaryBtnText: {
        textAlign: "center",
        fontWeight: "700",
        color: "white",
        letterSpacing: 0.2
    },
    scanSecondaryBtn: {
        backgroundColor: "#ef4444",
        paddingVertical: 12,
        borderRadius: 14
    },
    scanSecondaryBtnText: {
        textAlign: "center",
        fontWeight: "700",
        color: "white",
        letterSpacing: 0.2
    }
});









