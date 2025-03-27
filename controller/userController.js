const bcrypt = require("bcryptjs");

// Store user data in memory (replace with a database for persistence)
const users = {};

const getHomePage = (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
};

const getRole = (req, res) => {
    const { wallet } = req.params;
    if (users[wallet]) {
        res.json({ role: users[wallet].role || null });
    } else {
        res.json({ role: null });
    }
};

const setRole = (req, res) => {
    const { wallet, role } = req.body;

    if (!wallet || !role) {
        return res.status(400).json({ message: "Wallet address and role are required." });
    }

    if (users[wallet]) {
        return res.status(403).json({ message: "Role already assigned. You cannot change it." });
    }

    users[wallet] = { role };
    console.log(`Wallet: ${wallet} set as ${role}`);
    res.json({ message: `Role set to ${role} for wallet ${wallet}` });
};

const registerUser = async (req, res) => {
    const { wallet, role, email, name, phone, password } = req.body;

    if (!wallet || !role || !email || !name || !phone || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    if (users[wallet] && users[wallet].email) {
        return res.status(400).json({ message: "User already registered with this wallet." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    users[wallet] = {
        ...users[wallet],
        role: role,
        email: email,
        name: name,
        phone: phone,
        password: hashedPassword,
        customDescription: "" // Initialize as empty string
    }; 
    console.log(`User registered: Wallet: ${wallet}, Role: ${role}, Name: ${name}`);
    res.json({ message: "Registration successful!" });
};

const getUser = (req, res) => {
    const wallet = req.params.wallet;
    if (users[wallet]) {
        return res.json({
            user: {
                role: users[wallet].role || null,
                email: users[wallet].email || null,
                name: users[wallet].name || "Unknown User",
                phone: users[wallet].phone || null,
                password: users[wallet].password || null,
                character: users[wallet].character || null,
                levels: users[wallet].levels || [{ power: 0 }],
                hp: users[wallet].hp || 100,
                xp: users[wallet].xp || 0,
                customDescription: users[wallet].customDescription || "" // Default to empty string
            }
        });
    } else {
        return res.json({ user: null });
    }
};

const setCharacter = (req, res) => {
    const { wallet, character } = req.body;

    if (!wallet) {
        return res.status(400).json({ message: "Wallet is required." });
    }

    if (users[wallet] && users[wallet].character) {
        return res.status(403).json({ message: "Character already assigned to this account." });
    }

    const characters = ["NFT143", "NFT256", "NFT168"];
    const assignedCharacter = character || characters[Math.floor(Math.random() * characters.length)];

    users[wallet] = {
        ...users[wallet],
        character: assignedCharacter
    };
    console.log(`Character ${assignedCharacter} assigned to wallet: ${wallet}`);
    res.json({ message: `Character ${assignedCharacter} assigned successfully`, character: assignedCharacter });
};

const updateUser = (req, res) => {
    const wallet = req.params.wallet;
    const { customDescription } = req.body;

    if (!wallet) {
        return res.status(400).json({ message: "Wallet is required." });
    }

    if (!users[wallet]) {
        return res.status(404).json({ message: "User not found." });
    }

    users[wallet] = {
        ...users[wallet],
        customDescription: customDescription || ""
    };

    console.log(`Updated customDescription for wallet ${wallet}: ${customDescription}`);
    res.json({ success: true, user: users[wallet] });
};

// Updated getMaps with correct image paths and positions
const getMaps = (req, res) => {
    const wallet = req.params.wallet;
    if (!users[wallet]) {
        return res.status(404).json({ message: "User not found" });
    }

    const maps = [
        { id: 1, name: "World of Algebra", description: "Master algebraic equations.", image: "/icons/Map1.png" },
        { id: 2, name: "Realm of Science", description: "Explore scientific principles.", image: "/icons/Map2.png" },
        { id: 3, name: "Filipino Fortress", description: "Dive into Filipino culture.", image: "/icons/Map3.png" },
        { id: 4, name: "MAPEH Empire", description: "Excel in arts and PE.", image: "/icons/Map4.png" },
        { id: 5, name: "ICT Utopia", description: "Learn tech and innovation.", image: "/icons/Map5.png" },
        { id: 6, name: "English Wilderness", description: "Conquer the English language.", image: "/icons/Map6.png" }
    ];

    res.json({ maps });
};

// Updated getQuests to match quest.js sample quests
const getQuests = (req, res) => {
    const wallet = req.params.wallet;
    const mapId = parseInt(req.params.mapId);
    if (!users[wallet]) {
        return res.status(404).json({ message: "User not found" });
    }

    const allQuests = {
        1: [
            { id: 1, title: "Solve Equations", description: "Complete 10 algebra problems.", xp: 30, badge: "Algebra Apprentice" },
            { id: 2, title: "Graph Basics", description: "Draw 5 graphs.", xp: 50, badge: "Graph Guru" }
        ],
        2: [
            { id: 3, title: "Science Experiment", description: "Conduct a simple experiment.", xp: 40, badge: "Science Scout" },
            { id: 4, title: "Physics Challenge", description: "Solve 5 physics problems.", xp: 60, badge: "Physics Pro" }
        ],
        3: [
            { id: 5, title: "Filipino Story", description: "Write a short story.", xp: 70, badge: "Storyteller" },
            { id: 6, title: "Language Quiz", description: "Answer 10 questions.", xp: 80, badge: "Language Learner" }
        ],
        4: [
            { id: 7, title: "Art Project", description: "Create a drawing.", xp: 50, badge: "Art Aficionado" },
            { id: 8, title: "PE Challenge", description: "Complete a workout.", xp: 60, badge: "Fitness Fan" }
        ],
        5: [
            { id: 9, title: "Code Basics", description: "Write a simple program.", xp: 70, badge: "Coder" },
            { id: 10, title: "Tech Quiz", description: "Answer 10 ICT questions.", xp: 80, badge: "Tech Titan" }
        ],
        6: [
            { id: 11, title: "Grammar Test", description: "Correct 10 sentences.", xp: 40, badge: "Grammar Guide" },
            { id: 12, title: "Essay Writing", description: "Write a 200-word essay.", xp: 60, badge: "Essay Expert" }
        ]
    };

    const quests = allQuests[mapId] || [];
    const userProgress = users[wallet].questProgress || {};
    res.json({ quests, progress: userProgress });
};

// Updated startQuest to match quest.js sample quests
const startQuest = (req, res) => {
    const wallet = req.params.wallet;
    const { questId } = req.body;

    if (!users[wallet]) {
        return res.status(404).json({ message: "User not found" });
    }

    const allQuests = [
        { id: 1, title: "Solve Equations", xp: 30 },
        { id: 2, title: "Graph Basics", xp: 50 },
        { id: 3, title: "Science Experiment", xp: 40 },
        { id: 4, title: "Physics Challenge", xp: 60 },
        { id: 5, title: "Filipino Story", xp: 70 },
        { id: 6, title: "Language Quiz", xp: 80 },
        { id: 7, title: "Art Project", xp: 50 },
        { id: 8, title: "PE Challenge", xp: 60 },
        { id: 9, title: "Code Basics", xp: 70 },
        { id: 10, title: "Tech Quiz", xp: 80 },
        { id: 11, title: "Grammar Test", xp: 40 },
        { id: 12, title: "Essay Writing", xp: 60 }
    ];
    const quest = allQuests.find(q => q.id === questId);

    if (!quest) {
        return res.status(400).json({ message: "Invalid quest ID" });
    }

    users[wallet].questProgress = users[wallet].questProgress || {};
    if (!users[wallet].questProgress[questId]) {
        users[wallet].questProgress[questId] = { status: "in_progress", completion: 0 };
    }

    res.json({ success: true, quest });
};

// Update exports
module.exports = {
    getHomePage,
    getRole,
    setRole,
    registerUser,
    getUser,
    setCharacter,
    updateUser,
    getMaps,
    getQuests,
    startQuest
};