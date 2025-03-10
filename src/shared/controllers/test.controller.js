const testController = {
  testApi: (req, res) => {
    res.json({ message: "API is active" });
  },
};

module.exports = testController;
