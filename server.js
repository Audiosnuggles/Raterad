const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const PLAYER_COUNT = 3;
const SOLVE_BONUS = 1000;

const vowels = ["A", "E", "I", "O", "U", "Ä", "Ö", "Ü"];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ".split("");

const wheelSegments = [
  { label: "500", val: 500, color: "#3b82f6" },
  { label: "100", val: 100, color: "#10b981" },
  { label: "BANKROTT", val: "BANKRUPT", color: "#000000" },
  { label: "300", val: 300, color: "#f59e0b" },
  { label: "200", val: 200, color: "#8b5cf6" },
  { label: "AUSSETZEN", val: "SKIP", color: "#ef4444" },
  { label: "400", val: 400, color: "#ec4899" },
  { label: "150", val: 150, color: "#14b8a6" },
  { label: "1000", val: 1000, color: "#eab308" },
  { label: "250", val: 250, color: "#06b6d4" }
];
const segmentDegree = 360 / wheelSegments.length;

const allPrizes = [
  { id: 1, name: "45-teiliges Tafelservice 'Hofpracht'", price: 500, img: "🍽️", bought: false, isGrand: false },
  { id: 2, name: "Dosensuppen Jahresvorrat", price: 300, img: "🥫", bought: false, isGrand: false },
  { id: 3, name: "Heimorgel (massiv Eiche)", price: 1200, img: "🎹", bought: false, isGrand: false },
  { id: 4, name: "32-Zoll Röhrenfernseher", price: 800, img: "📺", bought: false, isGrand: false },
  { id: 5, name: "Gartenzwerg-Armee (10 Stück)", price: 400, img: "🧙‍♂️", bought: false, isGrand: false },
  { id: 6, name: "Der ZONK (Plüschtier)", price: 100, img: "🐀", bought: false, isGrand: false },
  { id: 7, name: "Wanduhr 'Kuckuck'", price: 250, img: "🕰️", bought: false, isGrand: false },
  { id: 8, name: "Tischgrill 'Brutzelmeister'", price: 600, img: "🥩", bought: false, isGrand: false },
  { id: 9, name: "Fahrrad (ohne Sattel)", price: 450, img: "🚲", bought: false, isGrand: false },
  { id: 10, name: "Malediven Luxus-Urlaub", price: 3500, img: "🏝️", bought: false, isGrand: true },
  { id: 11, name: "Cabriolet 'Flitzer'", price: 5000, img: "🏎️", bought: false, isGrand: true },
  { id: 12, name: "Traumküche", price: 4000, img: "🍳", bought: false, isGrand: true },
  { id: 13, name: "Weltreise auf einem Kreuzfahrtschiff", price: 8000, img: "🚢", bought: false, isGrand: true },
  { id: 14, name: "Ein eigenes kleines Haus", price: 15000, img: "🏡", bought: false, isGrand: true },
  { id: 15, name: "Helikopter-Rundflug", price: 2500, img: "🚁", bought: false, isGrand: true },
  { id: 16, name: "Kofferset 'Jet Glamour'", price: 950, img: "🧳", bought: false, isGrand: false },
  { id: 17, name: "Heimtrainer mit Motivationsmangel", price: 1100, img: "🚴", bought: false, isGrand: false },
  { id: 18, name: "Mikrowelle Deluxe", price: 550, img: "📡", bought: false, isGrand: false },
  { id: 19, name: "Camcorder fuer Familienpeinlichkeiten", price: 900, img: "📹", bought: false, isGrand: false },
  { id: 20, name: "Kaffeemaschine 'Turbo Bohne'", price: 700, img: "☕", bought: false, isGrand: false },
  { id: 21, name: "Massagesessel in Kunstleder", price: 3200, img: "💺", bought: false, isGrand: true },
  { id: 22, name: "Whirlpool fuer den Wintergarten", price: 6200, img: "🛁", bought: false, isGrand: true },
  { id: 23, name: "Elektrischer Kleinwagen", price: 9000, img: "🚗", bought: false, isGrand: true },
  { id: 24, name: "Designer Kofferset fuer Weltflucht", price: 2800, img: "🎒", bought: false, isGrand: true },
  { id: 25, name: "Luxus Heimtrainer mit Displaywand", price: 4700, img: "🏋️", bought: false, isGrand: true },
  { id: 26, name: "Stereoanlage mit viel zu viel Bass", price: 850, img: "📻", bought: false, isGrand: false },
  { id: 27, name: "Ledercouch in ehrlichem Beige", price: 1400, img: "🛋️", bought: false, isGrand: false },
  { id: 28, name: "Waschmaschine 'Schleuderstar'", price: 980, img: "🧺", bought: false, isGrand: false },
  { id: 29, name: "Wellnesswochenende mit Bademantelpflicht", price: 3600, img: "🧖", bought: false, isGrand: true },
  { id: 30, name: "Wintergarten fuer Zimmerpflanzen mit Machtfantasien", price: 7100, img: "🌴", bought: false, isGrand: true }
];

const puzzleDatabase = [
  { category: "TV ZITAT", text: "GEH AUFS GANZE ODER NIMM DEN ZONK" },
  { category: "TV ZITAT", text: "GUTEN ABEND MEINE DAMEN UND HERREN" },
  { category: "TV SHOW", text: "WETTEN DASS" },
  { category: "TV SHOW", text: "DER PREIS IST HEISS" },
  { category: "FILMTITEL", text: "ALARM IM DARM" },
  { category: "FILMTITEL", text: "SCHNEEWITTCHEN UND DIE SIEBEN ZWERGE" },
  { category: "FILMTITEL", text: "VIER FAEUSTE FUER EIN HALLELUJA" },
  { category: "FILMTITEL", text: "DER MIT DEM WOLF TANZT" },
  { category: "FILMTITEL", text: "ZURUECK IN DIE ZUKUNFT" },
  { category: "DEUTSCHES INTERNET", text: "WARUM LIEGT HIER EIGENTLICH STROH" },
  { category: "ALLTAG", text: "ICH HABE GAR KEINE HOSE AN" },
  { category: "ALLTAG", text: "WO IST DIE FERNBEDIENUNG" },
  { category: "ALLTAG", text: "HABEN WIR NOCH MILCH" },
  { category: "KURIOS", text: "ALLES HAT EIN ENDE NUR DIE WURST HAT ZWEI" },
  { category: "WEISHEIT", text: "NUR GUCKEN NICHT ANFASSEN" },
  { category: "KURIOS", text: "LIEBER ARM DRAN ALS ARM AB" },
  { category: "SPRICHWORT", text: "IST DER FINGER OBEN WIRD MAN DICH LOBEN" },
  { category: "SPRICHWORT", text: "MORGENSTUND HAT GOLD IM MUND" },
  { category: "SPRICHWORT", text: "WER ANDEREN EINE GRUBE GRAEBT FAELLT SELBST HINEIN" },
  { category: "SPRICHWORT", text: "DER FRUEHE VOGEL FANGT DEN WURM" },
  { category: "REDEWENDUNG", text: "DA WIRD JA DER HUND IN DER PFANNE VERRUECKT" },
  { category: "REDEWENDUNG", text: "ICH GLAUBE MEIN SCHWEIN PFEIFT" },
  { category: "BAUERNREGEL", text: "KRAEHT DER HAHN AUF DEM MIST AENDERT SICH DAS WETTER" },
  { category: "LEBENSMOTTO", text: "WER SCHWANKT HAT MEHR VOM WEG" },
  { category: "GETRAENKE", text: "NOCH SO EIN SPRUCH KIEFERBRUCH" },
  { category: "KULINARIK", text: "HAUPTSACHE ES SCHMECKT UND MACHT SATT" },
  { category: "ESSEN", text: "POMMES SCHRANKE" },
  { category: "PARTY", text: "ATEMLOS DURCH DIE NACHT" },
  { category: "LIEDTEXT", text: "GRIECHISCHER WEIN UND DIE ALTBEKANNTEN LIEDER" },
  { category: "BELEIDIGUNG", text: "DU BIST ALS KIND ZU NAH AN DER WAND GESCHAUKELT" },
  { category: "BELEIDIGUNG", text: "WENN DUMMHEIT WEHTUN WUERDE" },
  { category: "ANMACHSPRUCH", text: "TAT ES WEH ALS DU VOM HIMMEL GEFALLEN BIST" },
  { category: "ANMACHSPRUCH", text: "KANNST DU SCHWIMMEN ICH ERTRINKE IN DEINEN AUGEN" },
  { category: "TIERE", text: "DER GEMEINE STUBENTIGER" },
  { category: "BERUFE", text: "ZITRONENFALTER" },
  { category: "HOBBY", text: "EXTREMBUEGELN" },
  { category: "TV ZITAT", text: "DAS IST SPITZE" },
  { category: "TV ZITAT", text: "ICH HABE HEUTE LEIDER KEIN FOTO FUER DICH" },
  { category: "TV SHOW", text: "DIE 100000 MARK SHOW" },
  { category: "TV SHOW", text: "RANSLM" },
  { category: "TV SHOW", text: "WER WIRD MILLIONAER" },
  { category: "FILMTITEL", text: "DIE NACKTE KANONE" },
  { category: "FILMTITEL", text: "EIN FISCH NAMENS WANDA" },
  { category: "FILMTITEL", text: "JENSEITS VON AFRIKA" },
  { category: "FILMTITEL", text: "GHOSTBUSTERS DIE GEISTERJAEGER" },
  { category: "FILMTITEL", text: "DREI HASELNUESSE FUER ASCHENBROEDEL" },
  { category: "ALLTAG", text: "DER MUELL MUSS NOCH RUNTER" },
  { category: "ALLTAG", text: "WER HAT DAS LETZTE KLOPAPIER GENOMMEN" },
  { category: "ALLTAG", text: "MACH MAL DAS FENSTER ZU ES ZIEHT" },
  { category: "ALLTAG", text: "ICH DACHTE DAS WAERE IM ANGEBOT" },
  { category: "ALLTAG", text: "NUR KURZ HINLEGEN UND PLOETZLICH IST MONTAG" },
  { category: "SPRICHWORT", text: "EINEM GESCHENKTEN GAUL SCHAUT MAN NICHT INS MAUL" },
  { category: "SPRICHWORT", text: "VIELE KOECHER VERDERBEN DEN BREI" },
  { category: "SPRICHWORT", text: "WER ZULETZT LACHT LACHT AM BESTEN" },
  { category: "SPRICHWORT", text: "AUS DEN AUGEN AUS DEM SINN" },
  { category: "SPRICHWORT", text: "KLEINVIEH MACHT AUCH MIST" },
  { category: "REDEWENDUNG", text: "JETZT IST ABER POLEN OFFEN" },
  { category: "REDEWENDUNG", text: "DA BEISST DIE MAUS KEINEN FADEN AB" },
  { category: "REDEWENDUNG", text: "DEN BOGEN UEBERSPANNEN" },
  { category: "REDEWENDUNG", text: "AUF KEINEN GRUENEN ZWEIG KOMMEN" },
  { category: "REDEWENDUNG", text: "ICH FALL VOM GLAUBEN AB" },
  { category: "ESSEN", text: "MANTAPLATTE MIT EXTRA MAYO" },
  { category: "ESSEN", text: "KARTOFFELSALAT OHNE DISKUSSION" },
  { category: "ESSEN", text: "CURRYWURST UM DREI UHR NACHTS" },
  { category: "ESSEN", text: "MILCHREIS MIT ZIMT UND ZUCKER" },
  { category: "ESSEN", text: "SCHNITZEL MIT POMMES ROT WEISS" },
  { category: "KULINARIK", text: "DER SALAT WAR NUR Deko" },
  { category: "PARTY", text: "DER DJ SPIELT SCHON WIEDER ABBA" },
  { category: "PARTY", text: "NOCH EIN KURZER FUER DEN WEG" },
  { category: "PARTY", text: "DAS WAR GARANTIERT DER LETZTE SHOT" },
  { category: "GETRAENKE", text: "KORN MIT FANTA" },
  { category: "GETRAENKE", text: "COLAWEIZEN ZUM FRUEHSTUECK" },
  { category: "GETRAENKE", text: "FILTERKAFFEE AUS DER THERMO KANNE" },
  { category: "BELEIDIGUNG", text: "DU HAST AUCH NUR EIN PRAKTIKUM IM HIRN GEMACHT" },
  { category: "BELEIDIGUNG", text: "DEIN AUFTRITT WAR EIN VERBRECHEN OHNE MOTIV" },
  { category: "BELEIDIGUNG", text: "NICHT DIE HELLSTE KERZE AUF DER TORTE" },
  { category: "ANMACHSPRUCH", text: "DEINE AUGEN FUNKELN WIE EINE TANKSTELLE BEI NACHT" },
  { category: "ANMACHSPRUCH", text: "BIST DU WIFI ICH SPUERE EINE VERBINDUNG" },
  { category: "BERUFE", text: "FENSTERPUTZER IM HOCHHAUS" },
  { category: "BERUFE", text: "NAGELSTUDIO KOENIGIN" },
  { category: "BERUFE", text: "NACHTPORTIER MIT GEHEIMNISSEN" },
  { category: "HOBBY", text: "KARAOKE MIT VIEL ZU VIEL EHRGEIZ" },
  { category: "HOBBY", text: "ANGELN IM REGEN" },
  { category: "HOBBY", text: "TUPPERDOSEN SORTIEREN" },
  { category: "KURIOS", text: "DAS INTERNET WAR MAL NEULAND" },
  { category: "KURIOS", text: "EINMAL MIT PROFIS ARBEITEN" },
  { category: "KURIOS", text: "VERTRAU MIR ICH HABE DAS AUF YOUTUBE GESEHEN" },
  { category: "LEBENSMOTTO", text: "WENN SCHON PEINLICH DANN MIT HALTUNG" },
  { category: "LEBENSMOTTO", text: "HEUTE CHAOS MORGEN AUSSCHLAFEN" },
  { category: "WEISHEIT", text: "WER NICHTS ERWARTET WIRD WENIGSTENS NICHT ENTTAEUSCHT" },
  { category: "WEISHEIT", text: "DAS LEBEN IST KEIN WUNSCHKONZERT ABER MANCHMAL EINE SCHLAGERPARADE" },
  { category: "TIERE", text: "DIE MAJESTAETISCHE TIEFKUEHLEULE" },
  { category: "TIERE", text: "DER UEBERFORDERTE GOLDHAMSTER" },
  { category: "TV SHOW", text: "FAMILIENDUELL IM STUDIO" },
  { category: "ALLTAG", text: "DAS PASSWORT STEHT AUF EINEM POST IT" },
  { category: "SPRICHWORT", text: "WER DEN PFENNIG NICHT EHRT IST DES TALERS NICHT WERT" },
  { category: "ESSEN", text: "KAESELAUCHSUPPE FUER ALLE" },
  { category: "KURIOS", text: "DAS HAT SO IN DER FACEBOOK GRUPPE GESTANDEN" },
  { category: "HOBBY", text: "MINIGOLF MIT GROSSER GESTE" },
  { category: "BERUFE", text: "REISEBUERO CHEF OHNE URLAUB" }
];

function clonePrizes() {
  return allPrizes.map((prize) => ({ ...prize, bought: false }));
}

function createPlayer(slot) {
  return {
    slot,
    name: `Spieler ${slot + 1}`,
    score: 0,
    prizes: [],
    socketId: null,
    connected: false,
    isCPU: false
  };
}

function createInitialState() {
  return {
    mode: null,
    phase: "setup",
    round: 1,
    maxRounds: 3,
    roundStarter: 0,
    currentPlayer: 0,
    guessedLetters: [" "],
    currentPuzzleText: "",
    currentCategory: "",
    currentSpinValue: 0,
    wheelRotation: 0,
    winnerIndex: null,
    solveBonus: SOLVE_BONUS,
    wheelSegments,
    shopItems: clonePrizes(),
    shop: {
      isOpen: false,
      isFinale: false,
      buyerIndex: null
    },
    players: Array.from({ length: PLAYER_COUNT }, (_value, index) => createPlayer(index)),
    hostSocketId: null
  };
}

let gameState = createInitialState();
let availablePuzzleIndices = [];
const scheduledTimers = new Set();
const socketClientKeys = new Map();
let hostClientKey = null;
let emptyRoomResetTimer = null;

function schedule(fn, delay) {
  const timer = setTimeout(() => {
    scheduledTimers.delete(timer);
    fn();
  }, delay);
  scheduledTimers.add(timer);
  return timer;
}

function clearScheduledTimers() {
  for (const timer of scheduledTimers) {
    clearTimeout(timer);
  }
  scheduledTimers.clear();
}

function clearEmptyRoomResetTimer() {
  if (emptyRoomResetTimer) {
    clearTimeout(emptyRoomResetTimer);
    emptyRoomResetTimer = null;
  }
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function randomItem(items) {
  return items[randomInt(items.length)];
}

function sanitizeName(value, fallback) {
  const cleaned = String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);
  return cleaned || fallback;
}

function normalizeText(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/ß/g, "SS")
    .replace(/\s+/g, " ")
    .trim();
}

function resetPuzzlePool() {
  availablePuzzleIndices = puzzleDatabase.map((_, index) => index);
}

function drawPuzzle() {
  if (!availablePuzzleIndices.length) {
    resetPuzzlePool();
  }
  const poolIndex = randomInt(availablePuzzleIndices.length);
  const puzzleIndex = availablePuzzleIndices.splice(poolIndex, 1)[0];
  return puzzleDatabase[puzzleIndex];
}

function getConnectedSocketIds() {
  return [...io.of("/").sockets.keys()];
}

function getClientKeyBySocket(socketId) {
  return socketClientKeys.get(socketId) || null;
}

function ensureHostAssignment(preferredSocketId = null) {
  const connectedSocketIds = getConnectedSocketIds();
  if (preferredSocketId && connectedSocketIds.includes(preferredSocketId)) {
    gameState.hostSocketId = preferredSocketId;
    return;
  }
  if (gameState.hostSocketId && connectedSocketIds.includes(gameState.hostSocketId)) {
    return;
  }
  gameState.hostSocketId = connectedSocketIds[0] || null;
}

function countSpectators() {
  if (gameState.mode === "online") {
    return 0;
  }
  const totalSockets = io.of("/").sockets.size;
  return Math.max(0, totalSockets - (gameState.hostSocketId ? 1 : 0));
}

function getPlayerIndexBySocket(socketId) {
  return gameState.players.findIndex((player) => player.socketId === socketId);
}

function bothOnlinePlayersReady() {
  return gameState.players.every((player) => Boolean(player.socketId));
}

function buildPublicState() {
  return {
    mode: gameState.mode,
    phase: gameState.phase,
    round: gameState.round,
    maxRounds: gameState.maxRounds,
    roundStarter: gameState.roundStarter,
    currentPlayer: gameState.currentPlayer,
    guessedLetters: [...gameState.guessedLetters],
    currentPuzzleText: gameState.currentPuzzleText,
    currentCategory: gameState.currentCategory,
    currentSpinValue: gameState.currentSpinValue,
    wheelRotation: gameState.wheelRotation,
    winnerIndex: gameState.winnerIndex,
    solveBonus: gameState.solveBonus,
    wheelSegments: gameState.wheelSegments,
    shopItems: gameState.shopItems.map((item) => ({ ...item })),
    shop: { ...gameState.shop },
    players: gameState.players.map((player) => ({
      slot: player.slot,
      name: player.name,
      score: player.score,
      prizes: [...player.prizes],
      connected: player.connected,
      isCPU: player.isCPU
    })),
    spectatorCount: countSpectators(),
    onlineReady: bothOnlinePlayersReady(),
    onlineSlotsTaken: gameState.players.filter((player) => Boolean(player.socketId)).length
  };
}

function getSessionInfo(socketId) {
  const playerIndex = getPlayerIndexBySocket(socketId);
  const isHost = socketId === gameState.hostSocketId;
  const isLocalController = (gameState.mode === "local" || gameState.mode === "cpu") && isHost;
  const roomFull = gameState.mode === "online" && bothOnlinePlayersReady() && playerIndex === -1;

  return {
    socketId,
    role: isLocalController ? "host" : playerIndex !== -1 ? `player${playerIndex + 1}` : roomFull ? "blocked" : "waiting",
    slotIndex: playerIndex,
    canControlAll: isLocalController && gameState.phase !== "setup",
    isHost,
    canConfigure:
      gameState.phase === "setup" &&
      (isHost || (gameState.mode === "online" && playerIndex === 0)),
    mode: gameState.mode,
    roomFull
  };
}

function emitSessionInfo(socket) {
  socket.emit("session_info", getSessionInfo(socket.id));
}

function refreshSessions() {
  ensureHostAssignment();
  for (const socket of io.of("/").sockets.values()) {
    emitSessionInfo(socket);
  }
}

function broadcastState() {
  io.emit("state_update", buildPublicState());
}

function syncAllClients() {
  broadcastState();
  refreshSessions();
}

function disconnectExtraOnlineSockets() {
  if (gameState.mode !== "online" || !bothOnlinePlayersReady()) {
    return;
  }

  const allowedSocketIds = new Set(
    gameState.players
      .map((player) => player.socketId)
      .filter(Boolean)
  );

  for (const socket of io.of("/").sockets.values()) {
    if (!allowedSocketIds.has(socket.id)) {
      socket.emit("room_full", {
        message: "Online-Spiel ist voll. Es gibt keine Zuschauerplaetze."
      });
      schedule(() => {
        if (io.of("/").sockets.has(socket.id)) {
          socket.disconnect(true);
        }
      }, 50);
    }
  }
}

function emitModerator(type, text = null) {
  io.emit("moderator_speak", { type, text });
}

function emitSfx(name) {
  io.emit("play_sfx", name);
}

function setNewPuzzle() {
  const nextPuzzle = drawPuzzle();
  gameState.currentPuzzleText = nextPuzzle.text;
  gameState.currentCategory = nextPuzzle.category;
  gameState.guessedLetters = [" "];
}

function revealEntirePuzzle() {
  const letters = [...gameState.currentPuzzleText].filter((char) => char !== " ");
  gameState.guessedLetters = [...new Set([...gameState.guessedLetters, ...letters])];
}

function isPuzzleSolved() {
  for (const char of gameState.currentPuzzleText) {
    if (char === " ") {
      continue;
    }
    if (!gameState.guessedLetters.includes(char)) {
      return false;
    }
  }
  return Boolean(gameState.currentPuzzleText);
}

function getAvailableLetters(isVowel) {
  return alphabet.filter((letter) => {
    if (gameState.guessedLetters.includes(letter)) {
      return false;
    }
    return isVowel ? vowels.includes(letter) : !vowels.includes(letter);
  });
}

function getCorrectLetters(isVowel) {
  const result = new Set();
  for (const char of gameState.currentPuzzleText) {
    if (!alphabet.includes(char)) {
      continue;
    }
    if (gameState.guessedLetters.includes(char)) {
      continue;
    }
    if (isVowel ? vowels.includes(char) : !vowels.includes(char)) {
      result.add(char);
    }
  }
  return [...result];
}

function getRevealedRatio() {
  const lettersOnly = [...gameState.currentPuzzleText].filter((char) => alphabet.includes(char));
  if (!lettersOnly.length) {
    return 0;
  }
  const revealed = lettersOnly.filter((char) => gameState.guessedLetters.includes(char)).length;
  return revealed / lettersOnly.length;
}

function isHumanTurn() {
  return !gameState.players[gameState.currentPlayer]?.isCPU;
}

function canControlTurn(socketId) {
  if (gameState.phase === "setup" || gameState.phase === "shop" || !isHumanTurn()) {
    return false;
  }
  if (gameState.mode === "local" || gameState.mode === "cpu") {
    return socketId === gameState.hostSocketId;
  }
  return getPlayerIndexBySocket(socketId) === gameState.currentPlayer;
}

function canOpenShop(socketId) {
  if (gameState.phase !== "solved") {
    return false;
  }
  if (gameState.mode === "local" || gameState.mode === "cpu") {
    return socketId === gameState.hostSocketId;
  }
  return getPlayerIndexBySocket(socketId) !== -1;
}

function canManageShop(socketId) {
  if (gameState.phase !== "shop") {
    return false;
  }
  if (gameState.mode === "local" || gameState.mode === "cpu") {
    return socketId === gameState.hostSocketId;
  }
  const playerIndex = getPlayerIndexBySocket(socketId);
  return playerIndex !== -1 && (playerIndex === gameState.shop.buyerIndex || playerIndex === 0);
}

function canResetGame(socketId) {
  if (gameState.mode === "local" || gameState.mode === "cpu") {
    return socketId === gameState.hostSocketId;
  }
  return getPlayerIndexBySocket(socketId) === 0 || socketId === gameState.hostSocketId;
}

function finishSolvedRound() {
  gameState.phase = "solved";
  gameState.currentSpinValue = 0;
  gameState.winnerIndex = gameState.currentPlayer;
  gameState.players[gameState.currentPlayer].score += SOLVE_BONUS;
  syncAllClients();
  emitModerator("win");
  schedule(() => {
    emitModerator(null, `${gameState.players[gameState.currentPlayer].name} kassiert noch ${SOLVE_BONUS} Euro Loesungsbonus. Glamour zahlt sich aus.`);
  }, 500);
  emitSfx("fanfare");
}

function nextPlayer() {
  gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
  gameState.phase = "action";
  gameState.currentSpinValue = 0;
  syncAllClients();
  emitModerator(null, `So, ${gameState.players[gameState.currentPlayer].name}, Liebling, du bist am Zug!`);
  scheduleCpuTurnIfNeeded(1600);
}

function handleSpinStart() {
  if (gameState.phase !== "action") {
    return;
  }
  gameState.phase = "spinning";
  gameState.currentSpinValue = 0;
  gameState.wheelRotation += (randomInt(4) + 5) * 360 + randomInt(360);
  syncAllClients();
  emitModerator("spin");

  schedule(() => {
    const normalizedRotation = ((360 - (gameState.wheelRotation % 360)) % 360);
    const segmentIndex = Math.floor(normalizedRotation / segmentDegree) % wheelSegments.length;
    const result = wheelSegments[segmentIndex];

    if (result.val === "BANKRUPT") {
      gameState.players[gameState.currentPlayer].score = 0;
      gameState.phase = "transition";
      syncAllClients();
      emitSfx("bankrupt");
      emitModerator("bankrupt");
      schedule(nextPlayer, 2500);
      return;
    }

    if (result.val === "SKIP") {
      gameState.phase = "transition";
      syncAllClients();
      emitSfx("buzzer");
      emitModerator("skip");
      schedule(nextPlayer, 2500);
      return;
    }

    gameState.currentSpinValue = result.val;
    gameState.phase = "guess_consonant";
    syncAllClients();
    emitModerator("guess_c");
    scheduleCpuTurnIfNeeded(1500);
  }, 5000);
}

function handleBuyVowel() {
  const currentPlayer = gameState.players[gameState.currentPlayer];
  if (gameState.phase !== "action" || currentPlayer.score < 250) {
    return;
  }
  currentPlayer.score -= 250;
  gameState.currentSpinValue = 0;
  gameState.phase = "guess_vowel";
  syncAllClients();
  emitModerator("guess_v");
  scheduleCpuTurnIfNeeded(1500);
}

function handleGuessLetter(letter) {
  const normalizedLetter = normalizeText(letter);
  if (!alphabet.includes(normalizedLetter)) {
    return;
  }
  if (gameState.guessedLetters.includes(normalizedLetter)) {
    return;
  }

  const isVowelPhase = gameState.phase === "guess_vowel";
  const isConsonantPhase = gameState.phase === "guess_consonant";
  if (!isVowelPhase && !isConsonantPhase) {
    return;
  }
  if (isVowelPhase && !vowels.includes(normalizedLetter)) {
    return;
  }
  if (isConsonantPhase && vowels.includes(normalizedLetter)) {
    return;
  }

  gameState.guessedLetters.push(normalizedLetter);
  const hitCount = [...gameState.currentPuzzleText].filter((char) => char === normalizedLetter).length;

  if (hitCount > 0) {
    if (isConsonantPhase) {
      const winnings = gameState.currentSpinValue * hitCount;
      gameState.players[gameState.currentPlayer].score += winnings;
      gameState.currentSpinValue = 0;
      if (isPuzzleSolved()) {
        syncAllClients();
        emitSfx("ding");
        emitModerator(null, `Sehr gut! ${hitCount} mal das ${normalizedLetter}. Das war der finale Treffer, Darling!`);
        finishSolvedRound();
        return;
      }
      gameState.phase = "action";
      syncAllClients();
      emitSfx("ding");
      emitModerator(null, `Sehr gut! ${hitCount} mal das ${normalizedLetter}. ${winnings} Euro wandern aufs Konto.`);
      scheduleCpuTurnIfNeeded(1600);
      return;
    }

    gameState.phase = "action";
    gameState.currentSpinValue = 0;
    if (isPuzzleSolved()) {
      syncAllClients();
      emitSfx("ding");
      emitModerator("correct");
      finishSolvedRound();
      return;
    }
    syncAllClients();
    emitSfx("ding");
    emitModerator("correct");
    scheduleCpuTurnIfNeeded(1600);
    return;
  }

  gameState.phase = "transition";
  gameState.currentSpinValue = 0;
  syncAllClients();
  emitSfx("buzzer");
  emitModerator("wrong");
  schedule(nextPlayer, 2500);
}

function handleBeginSolve() {
  if (gameState.phase !== "action") {
    return;
  }
  gameState.phase = "solve";
  syncAllClients();
  emitModerator("solve_prompt");
  scheduleCpuTurnIfNeeded(1500);
}

function handleCancelSolve() {
  if (gameState.phase !== "solve") {
    return;
  }
  gameState.phase = "action";
  syncAllClients();
  emitModerator(null, "Angst bekommen? Na gut, drehen Sie weiter.");
}

function handleSolveAttempt(attempt) {
  if (gameState.phase !== "solve") {
    return;
  }

  if (normalizeText(attempt) === normalizeText(gameState.currentPuzzleText)) {
    revealEntirePuzzle();
    syncAllClients();
    finishSolvedRound();
    return;
  }

  gameState.phase = "transition";
  syncAllClients();
  emitSfx("buzzer");
  emitModerator("solve_fail");
  schedule(nextPlayer, 2500);
}

function announceShopOpen(isFinale) {
  const scoreLine = gameState.players
    .map((player) => `${player.name} steht bei ${player.score} Euro`)
    .join(". ");
  emitModerator("score_announce");
  schedule(() => {
    emitModerator(null, `${scoreLine}.`);
  }, 2400);
  schedule(() => {
    emitModerator(isFinale ? "shop_finale" : "shop_inter");
  }, 6200);
}

function openShopPhase() {
  clearScheduledTimers();
  const isFinale = gameState.round >= gameState.maxRounds;
  if (isFinale) {
    gameState.winnerIndex = gameState.players.reduce((bestIndex, player, index, players) => {
      return player.score > players[bestIndex].score ? index : bestIndex;
    }, 0);
  }

  gameState.shop = {
    isOpen: true,
    isFinale,
    buyerIndex: gameState.winnerIndex
  };
  gameState.phase = "shop";
  syncAllClients();
  emitSfx("fanfare");
  announceShopOpen(isFinale);
  scheduleCpuShopIfNeeded();
}

function currentShopPool() {
  return gameState.shopItems.filter((item) => item.isGrand === gameState.shop.isFinale);
}

function buyShopItem(itemId) {
  const item = gameState.shopItems.find((entry) => entry.id === Number(itemId));
  if (!item || item.bought || item.isGrand !== gameState.shop.isFinale) {
    return;
  }

  const buyer = gameState.players[gameState.shop.buyerIndex];
  if (!buyer || buyer.score < item.price) {
    return;
  }

  buyer.score -= item.price;
  buyer.prizes.push(item.name);
  item.bought = true;
  syncAllClients();
  emitSfx("kaching");
  emitModerator(null, `Ah, eine exzellente Wahl, Liebling! ${item.name} gehört dir.`);
}

function continueFromShop() {
  if (gameState.shop.isFinale) {
    return;
  }

  clearScheduledTimers();
  gameState.round += 1;
  gameState.roundStarter = (gameState.roundStarter + 1) % gameState.players.length;
  gameState.currentPlayer = gameState.roundStarter;
  gameState.phase = "action";
  gameState.winnerIndex = null;
  gameState.currentSpinValue = 0;
  gameState.solveBonus = SOLVE_BONUS;
  gameState.shop = {
    isOpen: false,
    isFinale: false,
    buyerIndex: null
  };
  setNewPuzzle();
  syncAllClients();
  emitSfx("ding");
  emitModerator("new_round");
  schedule(() => {
    emitModerator(null, `So, ${gameState.players[gameState.currentPlayer].name}, diesmal darfst du anfangen!`);
  }, 2600);
  scheduleCpuTurnIfNeeded(3600);
}

function chooseCpuLetter(isVowel) {
  const remainingLetters = getAvailableLetters(isVowel);
  if (!remainingLetters.length) {
    return null;
  }

  const correctLetters = getCorrectLetters(isVowel);
  const prefersCorrect = Math.random() < (isVowel ? 0.78 : 0.68);
  if (prefersCorrect && correctLetters.length) {
    return randomItem(correctLetters);
  }
  return randomItem(remainingLetters);
}

function scheduleCpuTurnIfNeeded(delay = 1800) {
  if (gameState.mode !== "cpu") {
    return;
  }
  if (!gameState.players[gameState.currentPlayer]?.isCPU) {
    return;
  }

  schedule(() => {
    const activePlayer = gameState.players[gameState.currentPlayer];
    if (
      gameState.mode !== "cpu" ||
      gameState.phase === "setup" ||
      gameState.phase === "shop" ||
      !activePlayer?.isCPU
    ) {
      return;
    }

    if (gameState.phase === "action") {
      const canBuyVowel = activePlayer.score >= 250 && getAvailableLetters(true).length > 0;
      const revealRatio = getRevealedRatio();

      if (revealRatio > 0.7 && Math.random() < 0.55) {
        handleBeginSolve();
        schedule(() => handleSolveAttempt(gameState.currentPuzzleText), 1600);
        return;
      }

      if (canBuyVowel && Math.random() < 0.35) {
        handleBuyVowel();
        return;
      }

      handleSpinStart();
      return;
    }

    if (gameState.phase === "guess_consonant") {
      const consonant = chooseCpuLetter(false);
      if (consonant) {
        handleGuessLetter(consonant);
      } else {
        nextPlayer();
      }
      return;
    }

    if (gameState.phase === "guess_vowel") {
      const vowel = chooseCpuLetter(true);
      if (vowel) {
        handleGuessLetter(vowel);
      } else {
        nextPlayer();
      }
      return;
    }

    if (gameState.phase === "solve") {
      handleSolveAttempt(gameState.currentPuzzleText);
    }
  }, delay);
}

function scheduleCpuShopIfNeeded() {
  if (gameState.mode !== "cpu" || gameState.phase !== "shop") {
    return;
  }

  const buyer = gameState.players[gameState.shop.buyerIndex];
  if (!buyer?.isCPU) {
    return;
  }

  const affordableItems = currentShopPool().filter((item) => !item.bought && item.price <= buyer.score);
  if (!affordableItems.length) {
    return;
  }

  schedule(() => {
    const refreshedBuyer = gameState.players[gameState.shop.buyerIndex];
    if (gameState.phase !== "shop" || !refreshedBuyer?.isCPU) {
      return;
    }

    const options = currentShopPool().filter((item) => !item.bought && item.price <= refreshedBuyer.score);
    if (!options.length) {
      return;
    }

    const chosen = randomItem(options);
    buyShopItem(chosen.id);

    if (Math.random() < 0.45) {
      scheduleCpuShopIfNeeded();
    }
  }, 1800);
}

function startConfiguredGame(mode) {
  clearScheduledTimers();
  clearEmptyRoomResetTimer();
  gameState.mode = mode;
  gameState.phase = "action";
  gameState.round = 1;
  gameState.maxRounds = 3;
  gameState.roundStarter = 0;
  gameState.currentPlayer = 0;
  gameState.currentSpinValue = 0;
  gameState.wheelRotation = 0;
  gameState.winnerIndex = null;
  gameState.solveBonus = SOLVE_BONUS;
  gameState.shopItems = clonePrizes();
  gameState.shop = {
    isOpen: false,
    isFinale: false,
    buyerIndex: null
  };
  gameState.players.forEach((player, index) => {
    player.score = 0;
    player.prizes = [];
    if (mode === "online") {
      player.isCPU = false;
      player.connected = Boolean(player.socketId);
      return;
    }
    player.connected = true;
    player.isCPU = mode === "cpu" && index > 0;
  });
  setNewPuzzle();
  syncAllClients();
  emitModerator("start");
  emitSfx("fanfare");
  scheduleCpuTurnIfNeeded(1800);
}

function resetGame() {
  const connectedSocketIds = getConnectedSocketIds();
  const preferredHost = connectedSocketIds.includes(gameState.hostSocketId) ? gameState.hostSocketId : connectedSocketIds[0] || null;
  clearScheduledTimers();
  clearEmptyRoomResetTimer();
  gameState = createInitialState();
  ensureHostAssignment(preferredHost);
  syncAllClients();
}

app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
  clearEmptyRoomResetTimer();
  ensureHostAssignment(socket.id);
  emitSessionInfo(socket);
  broadcastState();
  refreshSessions();

  socket.on("register_client", ({ clientKey } = {}) => {
    const normalizedKey = String(clientKey || "").trim().slice(0, 120);
    if (!normalizedKey) {
      return;
    }

    socketClientKeys.set(socket.id, normalizedKey);

    if ((gameState.mode === "local" || gameState.mode === "cpu") && hostClientKey === normalizedKey) {
      gameState.hostSocketId = socket.id;
      gameState.players[0].socketId = socket.id;
      gameState.players[0].connected = true;
      syncAllClients();
      return;
    }

    emitSessionInfo(socket);
  });

  socket.on("configure_local_game", (payload = {}) => {
    if (gameState.phase !== "setup" || socket.id !== gameState.hostSocketId) {
      return;
    }

    const mode = payload.mode === "cpu" ? "cpu" : "local";
    gameState.mode = mode;
    gameState.players[0].name = sanitizeName(payload.player1Name, "Spieler 1");
    gameState.players[1].name = sanitizeName(
      payload.player2Name,
      mode === "cpu" ? "CPU Klaus 3000" : "Spieler 2"
    );
    gameState.players[2].name = sanitizeName(
      payload.player3Name,
      mode === "cpu" ? "CPU Brigitte Bot" : "Spieler 3"
    );
    gameState.players[0].socketId = socket.id;
    gameState.players[0].connected = true;
    gameState.players[0].isCPU = false;
    gameState.players[1].socketId = null;
    gameState.players[1].connected = true;
    gameState.players[1].isCPU = mode === "cpu";
    gameState.players[2].socketId = null;
    gameState.players[2].connected = true;
    gameState.players[2].isCPU = mode === "cpu";
    hostClientKey = getClientKeyBySocket(socket.id) || hostClientKey;
    startConfiguredGame(mode);
  });

  socket.on("join_online", (payload = {}) => {
    if (gameState.mode && gameState.mode !== "online") {
      return;
    }

    gameState.mode = "online";
    let playerIndex = getPlayerIndexBySocket(socket.id);
    if (playerIndex === -1) {
      playerIndex = gameState.players.findIndex((player) => !player.socketId);
    }
    if (playerIndex === -1) {
      emitSessionInfo(socket);
      broadcastState();
      return;
    }

    const player = gameState.players[playerIndex];
    player.socketId = socket.id;
    player.connected = true;
    player.isCPU = false;
    player.name = sanitizeName(payload.name, `Spieler ${playerIndex + 1}`);
    if (playerIndex === 0) {
      gameState.hostSocketId = socket.id;
    }
    syncAllClients();
    disconnectExtraOnlineSockets();
  });

  socket.on("start_online_game", () => {
    const playerIndex = getPlayerIndexBySocket(socket.id);
    if (gameState.phase !== "setup" || gameState.mode !== "online" || playerIndex !== 0 || !bothOnlinePlayersReady()) {
      return;
    }
    startConfiguredGame("online");
  });

  socket.on("spin_wheel", () => {
    if (!canControlTurn(socket.id)) {
      return;
    }
    handleSpinStart();
  });

  socket.on("buy_vowel", () => {
    if (!canControlTurn(socket.id)) {
      return;
    }
    handleBuyVowel();
  });

  socket.on("guess_letter", ({ letter } = {}) => {
    if (!canControlTurn(socket.id)) {
      return;
    }
    handleGuessLetter(letter);
  });

  socket.on("begin_solve", () => {
    if (!canControlTurn(socket.id)) {
      return;
    }
    handleBeginSolve();
  });

  socket.on("cancel_solve", () => {
    if (!canControlTurn(socket.id)) {
      return;
    }
    handleCancelSolve();
  });

  socket.on("solve_puzzle", ({ attempt } = {}) => {
    if (!canControlTurn(socket.id)) {
      return;
    }
    handleSolveAttempt(attempt);
  });

  socket.on("open_shop", () => {
    if (!canOpenShop(socket.id)) {
      return;
    }
    openShopPhase();
  });

  socket.on("buy_item", ({ itemId } = {}) => {
    if (!canManageShop(socket.id)) {
      return;
    }
    buyShopItem(itemId);
  });

  socket.on("continue_from_shop", () => {
    if (!canManageShop(socket.id) || gameState.phase !== "shop" || gameState.shop.isFinale) {
      return;
    }
    continueFromShop();
  });

  socket.on("reset_game", () => {
    if (!canResetGame(socket.id)) {
      return;
    }
    resetGame();
  });

  socket.on("disconnect", () => {
    const disconnectedClientKey = getClientKeyBySocket(socket.id);
    socketClientKeys.delete(socket.id);
    const playerIndex = getPlayerIndexBySocket(socket.id);
    if (playerIndex !== -1) {
      gameState.players[playerIndex].socketId = null;
      gameState.players[playerIndex].connected = false;
    }

    if (!io.of("/").sockets.size) {
      clearEmptyRoomResetTimer();
      emptyRoomResetTimer = setTimeout(() => {
        if (!io.of("/").sockets.size) {
          clearScheduledTimers();
          gameState = createInitialState();
          hostClientKey = null;
          socketClientKeys.clear();
        }
        emptyRoomResetTimer = null;
      }, 30000);
      return;
    }

    if ((gameState.mode === "local" || gameState.mode === "cpu") && disconnectedClientKey && disconnectedClientKey === hostClientKey) {
      gameState.hostSocketId = null;
    }

    ensureHostAssignment();
    syncAllClients();
  });
});

server.listen(PORT, () => {
  console.log(`Raterad Royale läuft auf http://localhost:${PORT}`);
});
