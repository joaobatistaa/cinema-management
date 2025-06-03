import fs from "fs";
import path from "path";

const transactionsFilePath = path.join(process.cwd(), "src", "data", "transactions.json");

function readTransactions() {
  if (!fs.existsSync(transactionsFilePath)) {
    fs.writeFileSync(transactionsFilePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(transactionsFilePath, "utf-8");
  return JSON.parse(data);
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
