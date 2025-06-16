import fs from "fs";
import path from "path";

const transactionsFilePath = path.join(process.cwd(), "src", "data", "transactions.json");

function readTransactions() {
  if (!fs.existsSync(transactionsFilePath)) {
    fs.writeFileSync(transactionsFilePath, JSON.stringify([]));
  }
  let data = "";
  try {
    data = fs.readFileSync(transactionsFilePath, "utf-8");
    // Se o ficheiro estiver vazio, retorna array vazio
    if (!data.trim()) return [];
    return JSON.parse(data);
  } catch (err) {
    // Se o ficheiro estiver corrompido ou vazio, reescreve como array vazio
    fs.writeFileSync(transactionsFilePath, JSON.stringify([]));
    return [];
  }
}

function writeTransactions(transactions) {
  fs.writeFileSync(transactionsFilePath, JSON.stringify(transactions, null, 2));
}

export function getTransactions() {
  return readTransactions();
}

export async function addTransaction(transaction) {
  const transactions = readTransactions();
  transactions.push({
    ...transaction,
    id: Date.now().toString(),
  });
  writeTransactions(transactions);
}
