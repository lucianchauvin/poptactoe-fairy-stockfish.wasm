const process = require("process");
const fs = require("fs");
const readline = require("readline");
const Stockfish = require("./stockfish.js");
let stockfish;
const poptactoe_variant = `[poptactoe]
maxRank = 8
maxFile = 8
immobile = R
startFen = 8/8/8/8/8/8/8/8[RRRRRRRRrrrrrrrr] w - - 0 1
mutuallyImmuneTypes = R
pieceDrops = true
mustDrop = true
doubleStep = false
castling = false
stalemateValue = draw
immobilityIllegal = false
connectN = 3
promotionRegionWhite = -
promotionRegionBlack = -`;

const UCI_NNUE_FILE = process.env.UCI_NNUE_FILE;

async function loadPopVariant(poptactoe_variant) {
  if (!poptactoe_variant) return;

  const FS = stockfish.FS;
  const filename = "/poptactoe.ini";
  FS.writeFile(filename, poptactoe_variant);
  stockfish.postMessage(`load ${filename}`);
}

async function runRepl(stockfish) {
  const iface = readline.createInterface({ input: process.stdin });
  for await (const command of iface) {
    if (command == "quit") {
      break;
    }
    stockfish.postMessage(command);
  }
  stockfish.postMessage("quit");
}

async function main(argv) {
  stockfish = await Stockfish();
  const FS = stockfish.FS;
  if (UCI_NNUE_FILE) {
    const buffer = await fs.promises.readFile(UCI_NNUE_FILE);
    const filename = "/" + UCI_NNUE_FILE.replace(/^.*[\\\/]/, "");
    FS.writeFile(filename, buffer);
    stockfish.postMessage(`setoption name EvalFile value ${filename}`);
  }
  if (argv.length > 0) {
    const commands = argv.join(" ").split("++");
    for (const command of commands) {
      stockfish.postMessage(command);
    }
    stockfish.postMessage("quit");
    return;
  }

  loadPopVariant(poptactoe_variant);
  runRepl(stockfish);
}

if (require.main === module) {
  main(process.argv.slice(2));
}
