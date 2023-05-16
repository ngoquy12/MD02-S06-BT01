const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// API lấy thông tin của tất cả user
app.get("/api/v1/users", (req, res) => {
  // Read file
  fs.readFile("./dev-data/users.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    } else {
      const users = JSON.parse(data);
      return res.status(200).json({
        status: "success",
        results: users.length,
        data: users,
      });
    }
  });
});

// API lấy thông tin một user theo Id
app.get("/api/v1/users/:id", (req, res) => {
  // La Id tu param
  const id = req.params.id;

  // Read file
  fs.readFile("./dev-data/users.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    } else {
      const users = JSON.parse(data);
      const user = users.find((el) => el._id === id);
      if (user) {
        return res.status(200).json({
          status: "success",
          data: user,
        });
      } else {
        return res.status(404).json({
          status: "success",
          message: "User not found",
        });
      }
    }
  });
});

// Xóa thông tin một user theo Id
app.delete("/api/v1/users/:id", (req, res) => {
  // Lấy id được truyền vào
  const id = req.params.id;
  // ĐỌc file
  fs.readFile("./dev-data/users.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    } else {
      const users = JSON.parse(data);
      // Kiểm tra id có tồn tại trong db không?
      const isUserId = users.find((user) => user._id === id);
      if (!isUserId) {
        return res.status(404).json({
          status: "success",
          message: "User not found",
        });
      } else {
        const newUsers = users.filter((user) => user._id !== id);
        fs.writeFileSync("./dev-data/users.json", JSON.stringify(newUsers));
        return res.status(200).json({
          status: "success",
          message: "Deleted successfully",
        });
      }
    }
  });
});

// checkExits
const checkExits = (req, res, next) => {
  console.log("check");
  // Đọc file
  fs.readFile("./dev-data/users.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    } else {
      const users = JSON.parse(data);
      const isEmail = users.find((user) => user.email === req.body.email);
      if (isEmail) {
        return res.status(400).json({
          message: "Email đã tồn tại",
        });
      }
      next();
    }
  });
};

// Thêm mới một user
app.post("/api/v1/users/", checkExits, (req, res) => {
  // Lấy dữ liệu từ phần body
  const { name, email } = req.body;

  // ĐỌc file
  fs.readFile("./dev-data/users.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    } else {
      const users = JSON.parse(data);

      const id = uuidv4();
      const newUser = {
        _id: id,
        name: name,
        email: email,
        role: "user",
        active: true,
        photo: "user-17.jpg",
        password: "12344",
      };
      // Thêm vào db
      users.push(newUser);
      fs.writeFileSync("./dev-data/users.json", JSON.stringify(users));
      return res.status(200).json({
        status: "success",
        message: "Created successfully",
      });
    }
  });
});

// Sửa thông tin user theo Id
app.put("/api/v1/users/:id", (req, res) => {
  // Lấy ra id
  const id = req.params.id;
  // Đọc file
  fs.readFile("./dev-data/users.json", "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    } else {
      // Ép kiểu
      const users = JSON.parse(data);
      // Kiểm tra user có tồn tại trong db?
      const getIndex = users.findIndex((user) => user._id === id);
      console.log(getIndex);
      // Nếu không tìm thấy
      if (getIndex === -1) {
        return res.status(404).json({
          status: "success",
          message: "User not found",
        });
      } else {
        users[getIndex] = { ...users[getIndex], ...req.body };
        fs.writeFileSync(
          "./dev-data/users.json",
          JSON.stringify(users),
          (err) => {
            if (err) throw err;
          }
        );
        return res.status(200).json({
          status: "success",
          message: "Updated successfully",
        });
      }
    }
    //
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
