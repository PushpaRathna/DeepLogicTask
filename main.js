const http = require("http");
const https = require("https");
const port = process.env.PORT || 4000;

function getRawData(callback) {
  let options = {
    host: "time.com",
    path: "/",
  };

  cb = (res) => {
    let str = "";
    res.on("data", (chunk) => (str += chunk));
    res.on("end", () => callback(str));
  };

  https.request(options, cb).end();
}

function parseHTML(data) {
  let container = data.split(
    '<div class="partial latest-stories" data-module_name="Latest Stories">\n          <h2 class="latest-stories__heading">Latest Stories</h2>\n          <ul>\n '
  );
  let list = container[1].split(' <li class="latest-stories__item">\n ');
  let out = [];
  for (let i of list) {
    if (i.trim() != "") {
      let link = "https://time.com" + i.split('<a href="')[1].split('">\n')[0];
      let title = i
        .split('<h3 class="latest-stories__item-headline">')[1]
        .split("</h3>")[0];
      out.push({ title, link });
    }
  }

  return out;
}

const requestListener = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  switch (req.url) {
    case "/getTimeStories":
      getRawData((d) => {
        res.writeHead(200);
        let obj = parseHTML(d);
        res.end(JSON.stringify(obj));
      });
      break;
    default:
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Resource not found" }));
      break;
  }
};

const server = http.createServer(requestListener);

server.listen(port, () => {
  console.log("server is started and running on port " + port);
});
