const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

router.get("/", userController.getHomePage);
router.get("/get-role/:wallet", userController.getRole);
router.post("/set-role", userController.setRole);
router.post("/register", userController.registerUser);
router.get("/user/:wallet", userController.getUser);
router.put("/user/:wallet", userController.updateUser); // Add PUT route for updating user
router.post("/set-character", userController.setCharacter);
// Update userRoutes.js
router.get("/maps/:wallet", userController.getMaps);
router.get("/quests/:wallet/:mapId", userController.getQuests);
router.post("/quests/start/:wallet", userController.startQuest);

module.exports = router;