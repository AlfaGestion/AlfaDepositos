import React, { createContext, useContext, useEffect, useState } from 'react';
// import { useNetInfo } from "@react-native-community/netinfo";
import Order from "@db/Order";
import OrderDetail from "@db/OrderDetail";
import Configuration from "@db/Configuration";
import { UserContext } from "@context/UserContext";
import VisitDetails from "@db/VisitDetails";
import { formatDate } from "@libraries/utils";
import { bulkInsert } from "@db/Functions";
import usePrintAndShare from "@hooks/usePrintAndShare";
import useTemplateShare from "@hooks/useTemplateShare";
import { generarComprobanteElectronico } from "@libraries/arca";
import Account from "@db/Account";
import Product from '../libraries/db/Product';
import ItemsExclude from '../libraries/db/ItemsExclude';
import SQLite from "@db/SQLiteCompat";

// Crear el contexto
const CartContext = createContext();

// Crear el proveedor del contexto
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [account, setAccount] = useState(
        orderMode == 'COMPRAS' ? {
            code: 2111010289,
            name: 'DepÃ³sito general',
            priceClass: 1,
            lista: 1
        } : null
    );
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [loadImages, setLoadImages] = useState(false)
    const [noPermiteDuplicarItem, setNoPermiteDuplicarItem] = useState(false)
    const [documentData, setDocumentData] = useState({
        invoiceType: '',
        typeDocument: orderMode == 'COMPRAS' ? 'RP' : 'IR',
        saleCondition: 'ctacte'
    })
    const [observation, setObservation] = useState("")
    const [editId, setEditId] = useState(null)
    const [isEditorder, setIsEditOrder] = useState(false)

    const [status, setStatus] = useState({
        error: false,
        message: null
    })
    // const netInfo = useNetInfo();
    const [login] = useContext(UserContext);
    const { generatePdf, printDocument } = usePrintAndShare();
    const { getTemplate } = useTemplateShare();
    const [globalPriceClass, setGlobalPriceClass] = useState(null)
    const [priceClassSelected, setPriceClassSelected] = useState(1)
    const [orderMode, setOrderMode] = useState('')

    useEffect(() => {
        if (orderMode == 'COMPRAS') {
            setAccount(null)
            setDocumentData({
                invoiceType: '',
                typeDocument: 'RP',
                saleCondition: ''
            })
        } else if (orderMode == 'INVENTARIO') {
            setAccount({
                code: 2111010289,
                name: 'DepÃ³sito general',
                priceClass: 1,
                lista: 1
            })
            setDocumentData({
                invoiceType: '',
                typeDocument: 'IR',
                saleCondition: ''
            })
        }
        setIsEditOrder(false)
        setEditId(null)
    }, [orderMode])

    useEffect(() => {
        const priceToShow = `price${globalPriceClass}`;
        setPriceClassSelected(priceToShow)
        loadConfiguration()

    }, [globalPriceClass])

    const loadConfiguration = async () => {
        const cargaImagenes = await Configuration.getConfig("CARGA_IMAGENES");
        const noPermiteItemDuplicado = await Configuration.getConfigValue("NO_PERMITE_ITEMS_DUPLICADOS_CPTE") == 1

        if (cargaImagenes) {
            if (cargaImagenes[0]?.value == '1') {
                setLoadImages(true)
            }
        }

        setNoPermiteDuplicarItem(noPermiteItemDuplicado)
    }

    const loadEditOrder = async (orderId) => {
        setIsLoading(true)
        setEditId(orderId)
        setIsEditOrder(true)

        const order = await Order.find(parseInt(orderId));
        // console.log(order)
        const account = await Account.findBy({ code_eq: order?.account });

        setAccount({
            code: order?.account,
            name: account?.name,
            priceClass: order?.price_class,
            lista: account?.lista
        })

        const priceToShow = `price${order?.price_class}`;
        setPriceClassSelected(priceToShow)

        setDocumentData({
            invoiceType: order?.cpte,
            typeDocument: order?.tc,
            saleCondition: order?.condition
        })
        setObservation(order?.obs || "")

        const orderItems = await OrderDetail.findByIdOrder(orderId)
        orderItems.forEach(async (item) => {
            // console.log(item)
            const product = await Product.findBy({ code_eq: item.product })

            addToCart(product, item.qty, item.discount_perc, item?.bultos, parseFloat(item?.unitary))
        })

        // setCartItems(products)
        setIsLoading(false)
    }

    const save = async (isShare = false, forcePrint = false) => {
        const watchdog = setTimeout(() => {
            console.log("[SAVE] watchdog timeout");
            setStatus({ error: true, message: "Timeout guardando comprobante. Intente nuevamente." });
            setIsSaving(false);
        }, 30000);
        const withTimeout = (promise, label, ms = 20000) =>
            Promise.race([
                promise,
                new Promise((_, reject) =>
                    setTimeout(() => {
                        console.log("[SAVE] timeout", label);
                        reject(new Error(`Timeout en ${label}`));
                    }, ms)
                ),
            ]);

        setIsSaving(true)
        let printInvoice = false
        let idOrder = editId;

        const esCpteElectronico = (documentData?.typeDocument == 'eFC' || documentData?.typeDocument == 'eNC' || documentData?.typeDocument == 'eND')

        // if (esCpteElectronico && !netInfo.isConnected) {
        // if (esCpteElectronico && !netInfo.isConnected) {
        //     setIsSaving(false)
        //     setStatus({ error: true, message: "No hay conexiÃ³n a internet" })
        //     return
        // }

        if (forcePrint) {
            printInvoice = true
        } else {
            try {
                printInvoice = await withTimeout(Configuration.getConfigValue("PRINT_SUNMI"), "getConfigValue(PRINT_SUNMI)") == 1
            } catch (e) {
                printInvoice = false
            }
        }

        let id = editId ? editId : 0;
        const total = getTotal()

        const props = {
            account: account?.code,
            name: account?.name,
            date: formatDate(new Date(), true),
            id_seller: login.user.user,
            net: total,
            iva: 21,
            total: total,
            transferred: esCpteElectronico ? 1 : 0,
            bill: 0,
            delivery: 0,
            price_class: account?.priceClass,
            condition: documentData?.saleCondition || null,
            cpte: documentData?.invoiceType || null,
            tc: documentData?.typeDocument || null,
            obs: observation || ''
            // obs: !netInfo.isConnected ? "No se valido stock por falta de conexion" : ""
        };


        if (editId) {
            props["id"] = idOrder
        } else {
            props["latitude"] = 0
            props["longitude"] = 0
        }

        const insertOrderFast = async (props) => {
            const db = await SQLite.openDatabase("alfadeposito.db");
            const columns = [
                "account",
                "date",
                "id_seller",
                "net",
                "iva",
                "total",
                "transferred",
                "bill",
                "delivery",
                "price_class",
                "latitude",
                "longitude",
                "condition",
                "cpte",
                "obs",
                "tc",
            ];
            const values = columns.map((key) => props[key] ?? null);
            const placeholders = columns.map(() => "?").join(", ");
            const sql = `INSERT INTO orders (${columns.join(", ")}) VALUES (${placeholders})`;

            const runInsert = () =>
                new Promise((resolve, reject) => {
                    db.transaction((tx) => {
                        tx.executeSql(
                            sql,
                            values,
                            (_tx, result) => resolve(result.insertId),
                            (_tx, error) => {
                                reject(error);
                                return true;
                            }
                        );
                    });
                });

            const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

            let lastError = null;
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    const insertPromise = runInsert();
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Timeout en Order.insertFast")), 8000)
                    );
                    return await Promise.race([insertPromise, timeoutPromise]);
                } catch (e) {
                    lastError = e;
                    console.log("[SAVE] Order.insertFast retry", attempt, e?.message || e);
                    await sleep(300);
                }
            }
            throw lastError || new Error("Error en Order.insertFast");
        };

        try {
            console.log("[SAVE] start", { editId, isShare, forcePrint });
            if (editId) {
                console.log("[SAVE] update order");
                await withTimeout(Order.update(props), "Order.update");
                //Elimino los productos de la base
                await withTimeout(OrderDetail.deleteItemsByOrderId(id), "OrderDetail.deleteItemsByOrderId");
            } else {
                try {
                    console.log("[SAVE] insert order");
                    console.log("[SAVE] Order.insertFast start");
                    idOrder = await withTimeout(insertOrderFast(props), "Order.insertFast");
                    console.log("[SAVE] Order.insertFast done", idOrder);

                    //Inserto la visita
                    try {
                        await withTimeout(VisitDetails.createTable(), "VisitDetails.createTable");
                        console.log("[SAVE] VisitDetails.findBy start");
                        const existsVisit = await withTimeout(VisitDetails.findBy({ account_eq: account.code }), "VisitDetails.findBy");
                        console.log("[SAVE] VisitDetails.findBy done");

                        if (!existsVisit) {
                            const dataVisit = {
                                visited: 1,
                                obs: "",
                                account: account.code,
                                seller: login.user.user,
                                date: formatDate(new Date(), true, false),
                            };

                            const visit = new VisitDetails(dataVisit);
                            console.log("[SAVE] VisitDetails.save start");
                            await withTimeout(visit.save(), "VisitDetails.save");
                            console.log("[SAVE] VisitDetails.save done");
                        }
                    } catch (e) {
                        console.log("[SAVE] VisitDetails skipped", e?.message || e);
                    }
                } catch (err) {
                    setIsSaving(false)
                    console.log(err);
                    clearTimeout(watchdog);
                    return;
                }
            }

            await withTimeout(saveProducts(idOrder, isShare, printInvoice), "saveProducts");
            clearTimeout(watchdog);
        } catch (e) {
            console.log(e);
            setStatus({ error: true, message: e?.message || "Error al guardar el comprobante." })
            setIsSaving(false)
            clearTimeout(watchdog);
        } finally {
            clearTimeout(watchdog);
            setIsSaving(false);
        }
    }

    async function saveProducts(orderId, isShare = false, isPrint = false) {
        const withTimeout = (promise, label, ms = 20000) =>
            Promise.race([
                promise,
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error(`Timeout en ${label}`)), ms)
                ),
            ]);

        let objectArray = [];
        let props = {};
        const esCpteElectronico = (documentData?.typeDocument == 'eFC' || documentData?.typeDocument == 'eNC' || documentData?.typeDocument == 'eND')

        cartItems.map((item) => {
            // console.log(item)
            props = {
                order_id: parseInt(orderId),
                product: item.code,
                qty: item.quantity,
                bultos: item?.bultos,
                unitary: item[priceClassSelected],
                total:
                    item.disc > 0 ? (item[priceClassSelected] - (item.disc * item[priceClassSelected]) / 100) * item.quantity : item[priceClassSelected] * item.quantity,
                transferred: 0,
                discount_perc: item.disc
            };

            // console.log(props)
            objectArray.push(props);
        });

        // return

        try {
            console.log("[SAVE] saveProducts start", { orderId, items: objectArray.length });

            if (noPermiteDuplicarItem) {
                await withTimeout(bulkInsert("items_exclude", objectArray.map(i => { return { code: i.product } })), "bulkInsert(items_exclude)");
            }

            await withTimeout(bulkInsert("orders_detail", objectArray), "bulkInsert(orders_detail)");

            //GENERO COMPROBANTE ELECTRONICO
            if (esCpteElectronico) {
                const eRes = await withTimeout(generarComprobanteElectronico(documentData?.typeDocument, parseInt(orderId)), "generarComprobanteElectronico", 30000)

                if (eRes?.error) {
                    // setErrorCpte(eRes.message)
                    setStatus({ error: true, message: eRes.message })
                    setIsSaving(false)
                    // setModalSavingVisible(false)
                    return
                }
            }

            if (isShare || isPrint || esCpteElectronico) {
                const order = await withTimeout(Order.find(parseInt(orderId)), "Order.find");
                const payload = { order, products: cartItems, };

                const account = await withTimeout(Account.findBy({ code_eq: order?.account }), "Account.findBy");
                payload.accountName = account ? account.name : "";
                payload.sellerName = login.user.name;

                if (isShare) {
                    const html = await withTimeout(getTemplate(esCpteElectronico ? "efc" : "order", payload), "getTemplate", 30000);
                    generatePdf(html);
                } else {
                    printDocument(payload)
                }
            }

            setStatus({ error: false, message: "Comprobante generado correctamente!" })
            restartCart()
            setIsSaving(false)
            console.log("[SAVE] saveProducts done");
            // console.log("PASO1")
            // navigation.setParams("reloadOrderList", true);
            // navigation.navigate("ListOrdersScreen", { reloadOrderList: true });
            // }
        } catch (e) {
            setStatus({ error: true, message: "Error al grabar items de pedido: " + e })
            setIsSaving(false)
            // console.log("Error al grabar items de pedido: " + e);
        }
    }

    const setSaleCondition = (saleCondition) => {
        setDocumentData({ ...documentData, saleCondition: saleCondition })
    }

    const setInvoiceType = (invoiceType) => {
        setDocumentData({ ...documentData, invoiceType: invoiceType })
    }

    const setTypeDocument = (typeDocument) => {
        setDocumentData({ ...documentData, typeDocument: typeDocument })
    }

    const setPriceClass = (classPrice) => {
        setAccount({ ...account, priceClass: classPrice })
    }

    const addAccount = (accountData) => {
        // console.log(accountData)
        const parsed = parseInt(accountData?.priceClass, 10);
        const normalized = {
            ...accountData,
            priceClass: Number.isFinite(parsed) && parsed > 0 ? parsed : 1
        }
        setAccount(normalized)
    }

    const removeAccount = () => {
        setAccount(null)
    }

    const resetEditState = () => {
        setIsEditOrder(false)
        setEditId(null)
    }


    const passValidations = async (product) => {
        if (noPermiteDuplicarItem) {
            const existingProduct = cartItems.find(item => item.id === product.id);

            //SI EXISTE EN EL COMPRBANTE ACTUAL, LO CANCELO
            if (existingProduct) {
                return false
            }

            //SI NO, BUSCO EN EL HISTORIAL
            const excludes = await ItemsExclude.query({ where: { code_eq: product.code } });
            if (excludes) {
                if (excludes?.length > 0) {
                    return false
                }
            }
        }

        return true
    }

    // Agregar un producto al carrito (actualiza la cantidad si ya estÃ¡ en el carrito)
    const addToCart = (product, quantity = 1, disc = 0, bultos = 0, newPrice = 0, sumProductToExisting = true) => {
        // console.log("s", product)
        setCartItems((prevItems) => {
            const existingProduct = prevItems.find(item => item.id === product.id);

            let actualPrice = 0;

            if (newPrice > 0) {
                actualPrice = newPrice
                product[`${`${priceClassSelected}`?.length < 3 ? ('price' + priceClassSelected) : priceClassSelected}`] = newPrice
            } else {
                actualPrice = product[priceClassSelected]
            }

            let priceWithDiscount = 0
            if (disc > 0) {
                // console.log(disc, product[priceClassSelected])
                priceWithDiscount = actualPrice - ((actualPrice * disc) / 100)
            }

            if (existingProduct) {
                if (disc == 0) {
                    priceWithDiscount = actualPrice - ((actualPrice * product.disc) / 100)
                }

                // console.log(sumProductToExisting)
                // Si el producto ya estÃ¡ en el carrito, actualizamos la cantidad
                return prevItems.map(item =>
                    item.id === product.id
                        ? {
                            ...item,
                            bultos: bultos > 0 ? bultos : parseInt(item.bultos),
                            disc: disc == 0 ? product.disc : 0,
                            priceWithDiscount: priceWithDiscount,
                            quantity: sumProductToExisting ? (quantity > 1 ? quantity : parseInt(item.quantity) + 1) : (parseInt(item?.quantity) + parseInt(quantity))
                        }  // Aumentamos la cantidad
                        : item
                );
            } else {
                // console.log(product)
                // Si no estÃ¡ en el carrito, lo agregamos con una cantidad de 1
                return [...prevItems, { ...product, bultos: bultos, priceWithDiscount: priceWithDiscount, quantity: parseInt(quantity), disc: disc, alicIva: (parseInt(product?.iva) == 0 || product?.iva == null) ? 21 : product?.iva }];
            }
        });
    };

    // Agrega muchos productos en un solo setState (evita bloqueos)
    const addManyToCart = (items = []) => {
        if (!Array.isArray(items) || items.length === 0) return;
        setCartItems((prevItems) => {
            const next = [...prevItems];
            const indexById = new Map(next.map((it, idx) => [it.id, idx]));

            for (const entry of items) {
                const product = entry.product;
                const qty = parseInt(entry.qty, 10) || 1;
                const disc = entry.disc || 0;
                const bultos = entry.bultos || 0;
                const newPrice = entry.newPrice || 0;

                let actualPrice = 0;
                if (newPrice > 0) {
                    actualPrice = newPrice;
                    product[`${`${priceClassSelected}`?.length < 3 ? ('price' + priceClassSelected) : priceClassSelected}`] = newPrice;
                } else {
                    actualPrice = product[priceClassSelected];
                }

                let priceWithDiscount = 0;
                if (disc > 0) {
                    priceWithDiscount = actualPrice - ((actualPrice * disc) / 100);
                }

                if (indexById.has(product.id)) {
                    const idx = indexById.get(product.id);
                    const item = next[idx];
                    const itemPriceWithDiscount = disc > 0 ? priceWithDiscount : item.priceWithDiscount;
                    next[idx] = {
                        ...item,
                        bultos: bultos > 0 ? bultos : parseInt(item.bultos),
                        disc: disc == 0 ? item.disc : 0,
                        priceWithDiscount: itemPriceWithDiscount,
                        quantity: parseInt(item.quantity) + qty
                    };
                } else {
                    next.push({
                        ...product,
                        bultos,
                        priceWithDiscount,
                        quantity: qty,
                        disc,
                        alicIva: (parseInt(product?.iva) == 0 || product?.iva == null) ? 21 : product?.iva
                    });
                    indexById.set(product.id, next.length - 1);
                }
            }
            return next;
        });
    };

    // Eliminar un producto del carrito
    const removeFromCart = (productCode) => {
        setCartItems((prevItems) => prevItems.filter(item => item.code !== productCode));
    };

    const getItem = (productCode) => {
        const item = cartItems.find(item => item.code === productCode);
        // console.log(item)
        if (!item) {
            return null;
        }

        return item
    }

    const getCurrentQuantity = (productCode) => {
        const item = cartItems.find(item => item.code === productCode);
        // console.log(item)
        if (!item) {
            return 0;
        }

        return item?.quantity
    }

    // Eliminar una unidad de un producto del carrito
    const decreaseQuantity = (productCode) => {
        setCartItems((prevItems) => {
            const product = prevItems.find(item => item.code === productCode);
            if (product && product.quantity == 1) {
                removeFromCart(productCode)
                return prevItems
            } else if (product && product.quantity > 0) {
                return prevItems.map(item =>
                    item.code === productCode
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            }
            return prevItems;
        });
    };


    // Limpiar el carrito
    const clearCart = () => {
        setCartItems([]);
    };

    const restartCart = () => {
        if (orderMode == 'COMPRAS') {
            setDocumentData({
                invoiceType: '',
                typeDocument: 'RP',
                saleCondition: ''
            })
        } else if (orderMode == 'INVENTARIO') {
            setDocumentData({
                invoiceType: '',
                typeDocument: 'IR',
                saleCondition: ''
            })
        }

        setAccount(null)
        setCartItems([])
        setIsEditOrder(false)
        setEditId(null)
        setObservation("")
    }

    // Calcular el total de la compra (suma de precios * cantidades)
    const getTotal = () => {
        return cartItems.reduce((total, item) => {
            if (item.disc > 0) {
                return total + ((item[priceClassSelected] - (item.disc * item[priceClassSelected]) / 100) * item.quantity)
            } else {
                return total + (item[priceClassSelected] * item.quantity)
            }
        }, 0)?.toFixed(2);
    };

    const getTotalDiscount = () => {
        return cartItems.reduce((total, item) => {
            if (item.disc > 0) {
                return total + (((item.disc * item[priceClassSelected]) / 100) * item.quantity)
            } else {
                return total
            }
        }, 0)?.toFixed(2);
    };

    const getSubtotal = () => {
        return cartItems.reduce((total, item) => {
            const aIva = (item.alicIva / 100) + 1
            return total + ((item[priceClassSelected] / aIva) * item.quantity)
        }, 0)?.toFixed(2);
    }



    const getDetalleIva = () => {
        const detalleIvas = []

        cartItems.forEach(item => {
            const aIva = (item.alicIva / 100) + 1
            const importeIva = (item[priceClassSelected] - (item[priceClassSelected] / aIva)) * item.quantity

            const index = detalleIvas.findIndex(d => d.iva == item.alicIva)

            if (index != -1) {
                detalleIvas[index].importe = detalleIvas[index].importe + importeIva
            } else {
                detalleIvas.push({
                    iva: item.alicIva,
                    importe: importeIva
                })
            }
        })

        return detalleIvas
    }

    // Obtener el total de artÃ­culos en el carrito
    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const deleteOrder = async () => {
        await OrderDetail.deleteItemsByOrderId(editId);
        await Order.destroy(editId);
    };

    return (
        <CartContext.Provider value={{ observation, setObservation, restartCart, resetEditState, setOrderMode, orderMode, noPermiteDuplicarItem, account, getItem, getTotalDiscount, passValidations, deleteOrder, isLoading, loadImages, isEditorder, loadEditOrder, isSaving, removeAccount, status, save, documentData, setPriceClass, setInvoiceType, setTypeDocument, setSaleCondition, getDetalleIva, addAccount, getSubtotal, getCurrentQuantity, cartItems, addToCart, addManyToCart, removeFromCart, decreaseQuantity, clearCart, getTotal, getTotalItems, globalPriceClass, setGlobalPriceClass }}>
            {children}
        </CartContext.Provider>
    );
};

// Hook para usar el contexto del carrito
export const useCart = () => useContext(CartContext);



