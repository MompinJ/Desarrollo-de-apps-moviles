const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// La cadena de conexion se lee de .env (MONGODB_URI) para no subir la contrasena al repo
const uri = process.env.MONGODB_URI;
// apiVersion 1, igual que en mongosh
const client = new MongoClient(uri, { serverApi: { version: "1" } });

async function main() {
    await client.connect();
    const db = client.db("sample_mflix");
    const movies = db.collection("movies");
    const usuarios = client.db("Ejercicio13").collection("usuarios");

    // Crea el usuario admin la primera vez que arranca el servidor
    await usuarios.updateOne(
        { usuario: "admin" },
        { $setOnInsert: { usuario: "admin", password: "admin123" } },
        { upsert: true }
    );

    app.post("/login", async (req, res) => {
        const { usuario, password } = req.body;
        const user = await usuarios.findOne({ usuario, password });
        if (!user) {
            return res.status(401).json({ ok: false, mensaje: "Usuario o contraseña incorrectos" });
        }
        res.json({ ok: true, usuario: user.usuario });
    });

    app.get("/movies", async (req, res) => {
        const data = await movies
            .find({}, { projection: { poster: 1, title: 1, fullplot: 1 } })
            .limit(60)
            .toArray();
        res.json(data);
    });

    app.listen(4000, () => console.log("Server running at http://localhost:4000"));
}

main().catch(console.error);
