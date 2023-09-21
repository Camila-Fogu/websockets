import express from "express";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const router = express.Router();
productsRouter.use(express.json());
productsRouter.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/", async (req, res) => {
  try {
    const productsFilePath = path.join(__dirname, "products.json");
    const data = await fs.readFile(productsFilePath, "utf8");
    const products = JSON.parse(data);

    const { limit } = req.query;

    let productListHTML = "";

    if (!limit) {
      productListHTML = products.map(
        (product) => `
        <h2>${product.title}</h2>
        <p>Categoria: ${product.category}</p>
        <p>Descripción: ${product.description}</p>
        <p>Precio: ${product.price}</p>
        <p>Stock: ${product.stock}</p>
        <p>Código de producto: ${product.code}</p>
        <p>ID: ${product.id}</p>
        <p>Estado: ${product.status}</p>
      `
      );

      let productsHTML = `<h1>Lista de productos</h1>${productListHTML}`;
      res.send(productsHTML);
    } else {
      for (let index = 0; index < limit; index++) {
        const product = products[index];

        productListHTML += `
        <h2>${product.title}</h2>
        <p>Categoria: ${product.category}</p>
        <p>Descripción: ${product.description}</p>
        <p>Precio: ${product.price}</p>
        <p>Stock: ${product.stock}</p>
        <p>Código de producto: ${product.code}</p>
        <p>ID: ${product.id}</p>
        <p>Estado: ${product.status}</p>
      `;
      }

      let productsHTML = `<h1>Lista de productos</h1>${productListHTML}`;
      res.send(productsHTML);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudieron obtener los productos" });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    let idProduct = parseInt(req.params.pid);

    const productsFilePath = path.join(__dirname, "products.json");
    const data = await fs.readFile(productsFilePath, "utf8");
    const products = JSON.parse(data);

    const product = products.find((prod) => prod.id === idProduct);
    let productListHTML = "";
    let productsHTML = "";

    if (product) {
      productListHTML = `
      <h2>${product.title}</h2>
      <p>Categoria: ${product.category}</p>
      <p>Descripción: ${product.description}</p>
      <p>Precio: ${product.price}</p>
      <p>Stock: ${product.stock}</p>
      <p>Código de producto: ${product.code}</p>
      <p>ID: ${product.id}</p>
      <p>Estado: ${product.status}</p>
        `;
    } else {
      res.status(400).json({ error: "Producto no encontrado" });
    }

    productsHTML = `<h1>Lista de productos</h1>${productListHTML}`;
    res.send(productsHTML);
  } catch {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, code, price, stock, category, status } =
      req.body;
    if (!title || !description || !price || !code || !stock || !category) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    const productsFilePath = path.join(__dirname, "products.json");
    const data = await fs.readFile(productsFilePath, "utf8");
    const products = JSON.parse(data);

    const ultimo = products.length > 0 ? products.length - 1 : 0;
    const lastId = ultimo > 0 ? products[ultimo].id + 1 : 1;

    const newProduct = {
      id: lastId,
      title,
      description,
      code,
      price,
      status: true,
      stock,
      category,
    };

    products.push(newProduct);
    await fs.writeFile(productsFilePath, JSON.stringify(products), "utf8");

    res
      .status(201)
      .json({ status: "success", message: "Producto agregado con éxito" });
  } catch (error) {
    res.status(400).json({ error: "Error al agregar el producto" });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    let idProduct = parseInt(req.params.pid);
    const { title, description, code, price, status, stock, category } =
      req.body;

    const productsFilePath = path.join(__dirname, "products.json");
    const data = await fs.readFile(productsFilePath, "utf8");
    const products = JSON.parse(data);
    const productIndex = products.findIndex((prod) => prod.id === idProduct);

    if (productIndex !== -1) {
      products[productIndex] = {
        ...products[productIndex],
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
      };

      await fs.writeFile(productsFilePath, JSON.stringify(products), "utf8");
      res
        .status(201)
        .json({ status: "success", message: "Producto actualizado con éxito" });
    } else {
      res.status(400).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(400).json({ error: "Error al actualizar el producto" });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    let idProduct = parseInt(req.params.pid);

    const productsFilePath = path.join(__dirname, "products.json");
    const data = await fs.readFile(productsFilePath, "utf8");
    const products = JSON.parse(data);
    const productIndex = products.findIndex((prod) => prod.id === idProduct);

    if (productIndex !== -1) {
      const deletedProduct = products.splice(productIndex, 1)[0];
      await fs.writeFile(productsFilePath, JSON.stringify(products), "utf8");
      res
        .status(201)
        .json({ status: "success", message: "Producto eliminado con éxito" });
    } else {
      res.status(400).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

export default router;
