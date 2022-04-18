import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import knex from "knex";
import yeast from "yeast";

const app = express();

const db = knex({
  client: "mysql",
  connection: {
    user: "root",
    password: "admin123",
    database: "url_shortener",
    host: "localhost",
  },
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.post("/", async (req, res) => {
  const { url } = req.body;
  const insertedUrl = await db("urls").insert({
    url,
  });

  const alias = yeast.encode(insertedUrl);
  res.redirect(`/?alias=${alias}`);
});

app.get("/", (req, res) => {
  const { alias } = req.query;

  ejs.renderFile(
    "views/index.ejs",
    {
      alias,
    },
    function (err, html) {
      if (err) {
        console.log(err);
      } else {
        res.send(html);
      }
    }
  );
});

app.get("/:alias_url", async (req, res, next) => {
  const { alias_url } = req.params;

  if (alias_url) {
    const decodedCode = yeast.decode(alias_url);

    if (decodedCode) {
      response = await db
        .select("url")
        .from("urls")
        .where("id", yeast.decode(alias_url))
        .first();
      res.redirect(response.url);
    }
  }
  next();
});

app.listen(3030, (error) => {
  if (error) {
    console.log("Something wrong");
    return;
  }

  console.log("Serving application on port: 3030");
});
