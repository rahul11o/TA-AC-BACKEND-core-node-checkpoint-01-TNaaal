var http = require("http");
var fs = require("fs");
var qs = require("querystring");
var path = require("path");
var url = require("url");
var usersDir = path.join(__dirname, "../contacts/");

var server = http.createServer(handleRequest);

function handleRequest(req, res) {
  var parsedUrl = url.parse(req.url, true);
  var storedData = "";
  req.on("data", (chunk) => {
    storedData += chunk;
  });
  req.on("end", () => {
    if (req.method === "GET" && parsedUrl.pathname === "/") {
      res.setHeader("Content-Type", "text/html");
      fs.createReadStream("../../index.html").pipe(res);
    } else if (req.method === "GET" && parsedUrl.pathname === "/about") {
      res.setHeader("Content-Type", "text/html");
      fs.createReadStream("../../about.html").pipe(res);
    } else if (
      req.method === "GET" &&
      parsedUrl.pathname === "/assets/stylesheets/style.css"
    ) {
      res.setHeader("Content-Type", "text/css");
      fs.createReadStream("../stylesheets/style.css").pipe(res);
    } else if (req.method === "GET" && parsedUrl.pathname === "/contact") {
      res.setHeader("Content-Type", "text/html");
      fs.createReadStream("../../contact.html").pipe(res);
    } else if (req.method === "POST" && parsedUrl.pathname === "/contact") {
      var formData = qs.parse(storedData);
      var userFileName = usersDir + formData.username + ".json";
      fs.open(userFileName, "wx", (err, fd) => {
        if (err) {
          console.log("error-1");
        } else {
          fs.write(fd, storedData, (err) => {
            if (err) {
              console.log("error writing to the file");
            } else {
              fs.close(fd, (err) => {
                if (err) {
                  console.log("error closing the file");
                } else {
                  res.end(`${formData.username} succefully created`);
                }
              });
            }
          });
        }
      });
    } else if (req.method === "GET" && parsedUrl.pathname === "/users") {
      if (!req.url.includes("?")) {
        console.log("all users");
        fs.readdir(usersDir, (err, files) => {
          if (err) {
            console.log("error1");
          }
          files.forEach((file) => {
            fs.readFile(usersDir + file, (err, content) => {
              if (err) {
                console.log(err);
              } else {
                res.end(content);
              }
            });
          });
        });
      } else if (req.url.includes("?")) {
        var unqUsername = parsedUrl.query.username;
        fs.readFile(path.join(usersDir, unqUsername + ".json"), (err, user) => {
          if (err) {
            console.log("error readin the file");
          } else {
            res.setHeader("Content-Type", "text/plain");
            res.end(user);
          }
        });
      }
    }
  });
}
server.listen(8000, () => {
  console.log("server listening on port 8000");
});
