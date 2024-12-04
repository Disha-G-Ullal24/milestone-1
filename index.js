const express = require("express");
const bodyParser = require("body-parser");
const cron = require("node-cron");

const app = express();
app.use(bodyParser.json());

const expenses = [];
const predefinedCategories = ["Food", "Travel", "Utilities", "Entertainment", "Other"];


app.post("/expenses", (req, res) => {
    const { category, amount, date } = req.body;

    if (!predefinedCategories.includes(category)) {
        return res.status(400).json({ status: "error", error: "Invalid category" });
    }
    if (amount <= 0) {
        return res.status(400).json({ status: "error", error: "Amount must be positive" });
    }

    const expense = { id: expenses.length + 1, category, amount, date: new Date(date) };
    expenses.push(expense);

    res.json({ status: "success", data: expense });
});

app.get("/expenses", (req, res) => {
    const { category, startDate, endDate } = req.query;
    let filteredExpenses = expenses;

    if (category) {
        filteredExpenses = filteredExpenses.filter(exp => exp.category === category);
    }
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        filteredExpenses = filteredExpenses.filter(exp => exp.date >= start && exp.date <= end);
    }

    res.json({ status: "success", data: filteredExpenses });
});


app.get("/expenses/analysis", (req, res) => {
    const analysis = {};

    expenses.forEach(exp => {
        analysis[exp.category] = (analysis[exp.category] || 0) + exp.amount;
    });

    res.json({ status: "success", data: analysis });
});


cron.schedule("0 0 * * 0", () => { 
    const now = new Date();
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    const weeklyExpenses = expenses.filter(exp => exp.date >= weekAgo);

    console.log("Weekly Summary:", weeklyExpenses);
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
