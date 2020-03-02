const path = require(`path`);
const fs = require(`fs-extra`);
const _ = require(`lodash`);
const util = require(`util`);
const carbone = require(`carbone`);
const telejson = require(`telejson`);
const express = require(`express`);
const bodyParser = require(`body-parser`);
const crypto = require("crypto");

const app = express();
const upload = require(`multer`)({ dest: `/tmp-reports/` });
const port = process.env.CARBONE_PORT || 3030;
const templatedir = "/app/templates/";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const render = util.promisify(carbone.render);

_.forEach(carbone.formatters, (formatter) => (formatter.$isDefault = true));

app.post("/template/:uid/render", async (req, res) => {
  console.log("TEMPLATE RENDER");
  console.log(req.body);
  const targetPath = templatedir + req.params.uid;
  let templateFilePath;
  let templateFileName;

  if (!fs.existsSync(targetPath)) {
    return res.status(404).send("template not found");
  }
  const files = fs.readdirSync(targetPath);

  if (!files || files.length !== 1) {
    return res.status(500).send("could not read template file from file system");
  }

  templateFileName = files[0];
  templateFilePath = targetPath + "/" + templateFileName;

  const originalNameWOExt = templateFileName
    .split(`.`)
    .slice(0, -1)
    .join(`.`);
  const originalFormat = templateFileName.split(`.`).reverse()[0];

  let data = req.body.data;
  let options = {};
  let formatters = {};

  try {
    options = req.body.options;
  } catch (e) {
    return res.status(500).send(`options not provided or formatted incorrectly`);
  }

  options.convertTo = options.convertTo || originalFormat;
  options.outputName = options.outputName || `${originalNameWOExt}.${options.convertTo}`;

  if (typeof data !== `object` || data === null) {
    try {
      data = req.body.data;
    } catch (e) {
      return res.status(500).send(`data not provided or formatted incorrectly`);
    }
  }

  try {
    formatters = telejson.parse(req.body.formatters);
  } catch (e) {}

  carbone.formatters = _.filter(carbone.formatters, (formatter) => formatter.$isDefault === true);

  carbone.addFormatters(formatters);

  let report = null;

  try {
    report = await render(templateFilePath, data, options);
  } catch (e) {
    console.log(e);
    return res.status(500).send(`Internal server error`);
  }

  res.setHeader(`Content-Disposition`, `attachment; filename=${options.outputName}`);
  res.setHeader(`Content-Transfer-Encoding`, `binary`);
  res.setHeader(`Content-Type`, `application/octet-stream`);
  res.setHeader(`Carbone-Report-Name`, options.outputName);

  return res.send(report);
});

app.get("/template/:uid", async (req, res) => {
  console.log("template check");
  const targetPath = templatedir + req.params.uid;
  if (!fs.existsSync(targetPath)) {
    return res.status(404).send("template not found");
  }
  return res.send();
});

app.post("/template", upload.single(`template`), async (req, res) => {
  console.log("template upload");
  console.log(req.file);
  const template = req.file;
  if (!template) {
    return res.status(400).send("must send a template file");
  }
  const hash = crypto.createHash("sha256");
  const readStream = fs.createReadStream(template.path);
  readStream
    .on("readable", function() {
      var chunk;
      while (null !== (chunk = readStream.read())) {
        hash.update(chunk);
      }
    })
    .on("end", function() {
      const hashres = hash.digest("hex");
      const targetPath = templatedir + hashres;
      if (!hashres) {
        return res.status(500).send("could not create hash");
      }
      if (fs.existsSync(targetPath)) {
        return res.status(400).send("template already exists");
      }

      fs.ensureDirSync(targetPath);
      fs.copy(template.path, targetPath + "/" + template.originalname, (err) => {
        if (err) return res.send(err);
        fs.remove(template.path);
        return res.send(JSON.stringify({ sha256: hashres }));
      });
    });
});

app.listen(port, () => console.log(`DocGen listening on port ${port}!`));
