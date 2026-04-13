import { useState, useEffect, useRef } from “react”;
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from “recharts”;
import { PieChart as PieChartIcon, Wallet, MailOpen, PiggyBank, Settings as SettingsIcon } from “lucide-react”;

function PencilIcon() {
return (
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
</svg>
);
}
function TrashIcon() {
return (
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<polyline points="3 6 5 6 21 6"/>
<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
<path d="M10 11v6"/><path d="M14 11v6"/>
<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
</svg>
);
}
function DragIcon() {
return (
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="18" x2="16" y2="18"/>
</svg>
);
}
function ChevronDown({ size = 14, style }) {
return (
<svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={style}>
<path d="M3 6l5 5 5-5" stroke="#9a9088" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
);
}

const STORAGE_KEY = “expense_tracker_data_v2”;

const DEFAULT_CATEGORIES = [
{ name: “Housing”,       icon: “🏠”, color: “#e07b54” },
{ name: “Food”,          icon: “🍜”, color: “#e8b84b” },
{ name: “Transport”,     icon: “🚗”, color: “#5b9bd5” },
{ name: “Health”,        icon: “💊”, color: “#2e9e5e” },
{ name: “Shopping”,      icon: “🛒”, color: “#b07fc7” },
{ name: “Entertainment”, icon: “🎬”, color: “#c94040” },
{ name: “Utilities”,     icon: “⚡”, color: “#52b8c4” },
{ name: “Other”,         icon: “📦”, color: “#a0a0a0” },
{ name: “Surplus”,       icon: “🏦”, color: “#f4c430” },
];
const SURPLUS_CAT = { name: “Surplus”, icon: “🏦”, color: “#f4c430” };

const DEFAULT_ACCOUNTS = [
{ id: 1, name: “Main” },
{ id: 2, name: “Savings” },
{ id: 3, name: “Cash” },
{ id: 4, name: “Credit Card” },
];

const PALETTE = [
“#e07b54”,”#e8b84b”,”#2e9e5e”,”#5b9bd5”,”#b07fc7”,
“#c94040”,”#52b8c4”,”#a0a0a0”,”#f4845f”,”#3d9970”,
“#ff6b6b”,”#ffd93d”,”#6bcb77”,”#4d96ff”,”#c77dff”,
];

const DEFAULT_DATA = {
expenses: [],
budgets: { Housing: 1200, Food: 500, Transport: 300, Health: 200, Shopping: 300, Entertainment: 150, Utilities: 200, Other: 100 },
paychecks: [],
funds: [],
categories: DEFAULT_CATEGORIES,
accounts: DEFAULT_ACCOUNTS,
defaultAccount: “Main”,
paySchedule: { frequency: “biweekly”, firstPayDate: “”, customDays: 14 },
paySchedules: [],
};

function fmt(n) {
return new Intl.NumberFormat(“en-US”, { style: “currency”, currency: “USD”, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
function getMonthKey(date) {
const d = new Date(date);
return d.getFullYear() + “-” + String(d.getMonth() + 1).padStart(2, “0”);
}
function today() {
const d = new Date();
return d.getFullYear() + “-” + String(d.getMonth() + 1).padStart(2, “0”) + “-” + String(d.getDate()).padStart(2, “0”);
}

const S = {
input:  { width: “100%”, background: “#f0ede8”, border: “1px solid #ddd8d0”, color: “#2a2520”, padding: “12px 14px”, borderRadius: 8, fontSize: 15, fontFamily: “inherit”, boxSizing: “border-box” },
label:  { fontSize: 11, letterSpacing: 2, textTransform: “uppercase”, fontFamily: “‘Righteous’, cursive”, color: “#9a9088”, display: “block”, marginBottom: 6 },
card:   { background: “#ffffff”, border: “1px solid #ddd8d0”, borderRadius: 12, padding: “16px”, marginBottom: 12 },
select: { width: “100%”, background: “#f0ede8”, border: “1px solid #ddd8d0”, color: “#2a2520”, padding: “12px 14px”, borderRadius: 8, fontSize: 15, fontFamily: “inherit”, boxSizing: “border-box”, appearance: “none”, WebkitAppearance: “none”, cursor: “pointer” },
};

function BottomSheet({ onClose, title, children }) {
return (
<div style={{ position: “fixed”, inset: 0, background: “rgba(0,0,0,0.8)”, zIndex: 200, display: “flex”, alignItems: “flex-end” }}>
<div style={{ width: “100%”, maxWidth: 600, margin: “0 auto”, background: “#ffffff”, borderRadius: “20px 20px 0 0”, padding: 24, borderTop: “1px solid #ddd8d0”, maxHeight: “90vh”, overflowY: “auto” }}>
<div style={{ fontSize: 11, letterSpacing: 3, textTransform: “uppercase”, fontFamily: “‘Righteous’, cursive”, color: “#7a736a”, marginBottom: 20 }}>{title}</div>
{children}
</div>
</div>
);
}

function CategoryModal({ cat, onSave, onClose }) {
const editing = !!cat;
const [name, setName] = useState(cat ? cat.name : “”);
const [icon, setIcon] = useState(cat ? cat.icon : “”);
const [color, setColor] = useState(cat ? cat.color : PALETTE[0]);

function handleSave() {
if (!name.trim()) return;
onSave({ name: name.trim(), icon: icon.trim() || name.trim().charAt(0), color });
}

return (
<BottomSheet title={editing ? “Edit Category” : “New Category”} onClose={onClose}>
<div style={{ display: “flex”, alignItems: “center”, gap: 14, marginBottom: 20, padding: “14px 16px”, background: “#f0ede8”, borderRadius: 12, border: “1px solid #ddd8d0” }}>
<div style={{ width: 48, height: 48, borderRadius: 12, background: color + “33”, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: 26 }}>{icon || “?”}</div>
<div>
<div style={{ fontSize: 16, fontWeight: “bold”, color }}>{name || “Category Name”}</div>
<div style={{ fontSize: 12, color: “#9a9088”, marginTop: 2 }}>Preview</div>
</div>
</div>
<div style={{ marginBottom: 16 }}>
<label style={S.label}>Category Name</label>
<input style={S.input} value={name} onChange={e => setName(e.target.value)} placeholder=“e.g. Pet Care, Coffee, Gym” />
</div>
<div style={{ marginBottom: 16 }}>
<label style={S.label}>Icon — tap field and open your emoji keyboard</label>
<div style={{ display: “flex”, alignItems: “center”, gap: 12 }}>
<div style={{ width: 52, height: 52, borderRadius: 12, background: color + “22”, border: “2px solid “ + color + “66”, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: 28, flexShrink: 0 }}>{icon || “?”}</div>
<input style={{ …S.input, fontSize: 26, textAlign: “center” }} value={icon}
onChange={e => {
const val = e.target.value;
if (!val) { setIcon(””); return; }
if (typeof Intl !== “undefined” && Intl.Segmenter) {
const segs = […new Intl.Segmenter().segment(val)];
setIcon(segs[segs.length - 1].segment);
} else {
const chars = […val];
setIcon(chars[chars.length - 1] || “”);
}
}}
placeholder=”(emoji)” inputMode=“text” />
</div>
<div style={{ fontSize: 11, color: “#9a9088”, marginTop: 8 }}>On iOS: tap the field, then tap the emoji key on your keyboard.</div>
</div>
<div style={{ marginBottom: 20 }}>
<label style={S.label}>Color</label>
<div style={{ display: “flex”, flexWrap: “wrap”, gap: 8 }}>
{PALETTE.map(c => (
<button key={c} onClick={() => setColor(c)}
style={{ width: 32, height: 32, borderRadius: “50%”, background: c, border: color === c ? “3px solid #2a2520” : “3px solid transparent”, cursor: “pointer”, boxSizing: “border-box” }} />
))}
<label style={{ width: 32, height: 32, borderRadius: “50%”, background: PALETTE.includes(color) ? “#ddd8d0” : color, border: “2px dashed #9a9088”, cursor: “pointer”, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: 14, position: “relative” }}>
<span style={{ color: “#9a9088” }}>+</span>
<input type=“color” value={color} onChange={e => setColor(e.target.value)} style={{ position: “absolute”, opacity: 0, width: “100%”, height: “100%”, cursor: “pointer” }} />
</label>
</div>
</div>
<div style={{ display: “flex”, gap: 10 }}>
<button onClick={handleSave} style={{ flex: 1, padding: 14, background: color, border: “none”, borderRadius: 10, color: “#f5f3ef”, fontSize: 14, fontWeight: “bold”, cursor: “pointer”, fontFamily: “inherit” }}>
{editing ? “Update Category” : “Add Category”}
</button>
<button onClick={onClose} style={{ padding: “14px 20px”, background: “transparent”, border: “1px solid #ddd8d0”, borderRadius: 10, color: “#7a736a”, fontSize: 14, cursor: “pointer”, fontFamily: “inherit” }}>Cancel</button>
</div>
</BottomSheet>
);
}

function AccountModal({ account, onSave, onClose }) {
const [name, setName] = useState(account ? account.name : “”);
function handleSave() { if (!name.trim()) return; onSave({ name: name.trim() }); }
return (
<BottomSheet title={account ? “Edit Account” : “New Account”} onClose={onClose}>
<div style={{ marginBottom: 20 }}>
<label style={S.label}>Account Name</label>
<input style={S.input} value={name} onChange={e => setName(e.target.value)} placeholder=“e.g. Chase Checking, Venmo” />
</div>
<div style={{ display: “flex”, gap: 10 }}>
<button onClick={handleSave} style={{ flex: 1, padding: 14, background: “#e07b54”, border: “none”, borderRadius: 10, color: “#f5f3ef”, fontSize: 14, fontWeight: “bold”, cursor: “pointer”, fontFamily: “inherit” }}>
{account ? “Update Account” : “Add Account”}
</button>
<button onClick={onClose} style={{ padding: “14px 20px”, background: “transparent”, border: “1px solid #ddd8d0”, borderRadius: 10, color: “#7a736a”, fontSize: 14, cursor: “pointer”, fontFamily: “inherit” }}>Cancel</button>
</div>
</BottomSheet>
);
}

function PaycheckModal({ paycheck, funds, onSave, onClose }) {
const [amount, setAmount] = useState(paycheck ? String(paycheck.amount) : “”);
const [label, setLabel] = useState(paycheck ? paycheck.label : “”);
const [date, setDate] = useState(paycheck ? paycheck.date : today());
const [allocMode, setAllocMode] = useState(paycheck && paycheck.customAlloc ? “custom” : “default”);
const [customAlloc, setCustomAlloc] = useState(paycheck && paycheck.customAlloc ? paycheck.customAlloc : {});

const allocTotal = Object.values(customAlloc).reduce((s, v) => s + (parseFloat(v) || 0), 0);
const amountNum = parseFloat(amount) || 0;

function handleSave() {
if (!amount || isNaN(parseFloat(amount))) return;
const fields = { amount: amountNum, label: label.trim() || “Paycheck”, date };
if (allocMode === “custom”) {
const cleaned = {};
Object.entries(customAlloc).forEach(([k, v]) => { if (parseFloat(v) > 0) cleaned[k] = parseFloat(v); });
fields.customAlloc = cleaned;
} else {
fields.customAlloc = null;
}
onSave(fields);
}

return (
<BottomSheet title={paycheck ? “Edit Paycheck” : “Add Paycheck”} onClose={onClose}>
<div style={{ marginBottom: 14 }}>
<label style={S.label}>Take-Home Amount ($)</label>
<input style={S.input} type=“number” value={amount} onChange={e => setAmount(e.target.value)} placeholder=“e.g. 1000” />
</div>
<div style={{ marginBottom: 14 }}>
<label style={S.label}>Label (optional)</label>
<input style={S.input} value={label} onChange={e => setLabel(e.target.value)} placeholder=“e.g. April Bonus” />
</div>
<div style={{ marginBottom: 20 }}>
<label style={S.label}>Date Received</label>
<input style={S.input} type=“date” value={date} onChange={e => setDate(e.target.value)} />
</div>
{funds && funds.length > 0 && (
<div style={{ marginBottom: 20 }}>
<label style={S.label}>Envelope Allocation</label>
<div style={{ display: “flex”, gap: 8, marginBottom: 12 }}>
{[[“default”, “Use default”], [“custom”, “Custom”]].map(([mode, lbl]) => (
<button key={mode} onClick={() => setAllocMode(mode)}
style={{ flex: 1, padding: “8px 0”, borderRadius: 8, border: “1px solid”, borderColor: allocMode === mode ? “#2e9e5e” : “#ddd8d0”, background: allocMode === mode ? “#2e9e5e22” : “transparent”, color: allocMode === mode ? “#2e9e5e” : “#9a9088”, fontSize: 12, cursor: “pointer”, fontFamily: “inherit” }}>
{lbl}
</button>
))}
</div>
{allocMode === “default” && <div style={{ fontSize: 11, color: “#9a9088” }}>Each envelope gets its usual cut from your paycheck.</div>}
{allocMode === “custom” && (
<div>
<div style={{ fontSize: 11, color: “#9a9088”, marginBottom: 10 }}>Set how much goes to each envelope. Leave blank for $0.</div>
{funds.map(fund => (
<div key={fund.id} style={{ display: “flex”, alignItems: “center”, gap: 10, marginBottom: 10 }}>
<span style={{ fontSize: 18, flexShrink: 0 }}>{fund.icon}</span>
<span style={{ flex: 1, fontSize: 13, color: “#2a2520” }}>{fund.name}</span>
<input type=“number”
value={customAlloc[fund.id] !== undefined ? customAlloc[fund.id] : “”}
onChange={e => setCustomAlloc(p => ({ …p, [fund.id]: e.target.value }))}
placeholder=“0”
style={{ width: 90, background: “#f0ede8”, border: “1px solid #ddd8d0”, color: “#2a2520”, padding: “8px 10px”, borderRadius: 8, fontSize: 14, fontFamily: “inherit”, textAlign: “right” }} />
</div>
))}
<div style={{ display: “flex”, justifyContent: “space-between”, paddingTop: 8, borderTop: “1px solid #ddd8d0”, fontSize: 12 }}>
<span style={{ color: “#9a9088” }}>Allocated</span>
<span style={{ color: allocTotal > amountNum ? “#c94040” : “#2e9e5e”, fontWeight: “bold” }}>{fmt(allocTotal)} / {fmt(amountNum)}</span>
</div>
</div>
)}
</div>
)}
<div style={{ display: “flex”, gap: 10 }}>
<button onClick={handleSave} style={{ flex: 1, padding: 14, background: “#2e9e5e”, border: “none”, borderRadius: 10, color: “#f5f3ef”, fontSize: 14, fontWeight: “bold”, cursor: “pointer”, fontFamily: “inherit” }}>
{paycheck ? “Update” : “Add Paycheck”}
</button>
<button onClick={onClose} style={{ padding: “14px 20px”, background: “transparent”, border: “1px solid #ddd8d0”, borderRadius: 10, color: “#7a736a”, fontSize: 14, cursor: “pointer”, fontFamily: “inherit” }}>Cancel</button>
</div>
</BottomSheet>
);
}

function FundModal({ fund, categories, budgets, onSave, onClose }) {
const editing = !!fund;
const [name, setName] = useState(fund ? fund.name : “”);
const [icon, setIcon] = useState(fund ? fund.icon : “”);
const [selectedCats, setSelectedCats] = useState(
fund ? (Array.isArray(fund.categories) ? fund.categories : (fund.category ? [fund.category] : [])) : (categories[0] ? [categories[0].name] : [])
);
const [paycheckAllocation, setPaycheckAllocation] = useState(fund ? String(fund.paycheckAllocation || “”) : “”);
const derivedMonthlyAllocation = selectedCats.reduce((sum, cn) => sum + (budgets[cn] || 0), 0);

function toggleCat(n) { setSelectedCats(prev => prev.includes(n) ? prev.filter(c => c !== n) : […prev, n]); }

function handleSave() {
if (!name.trim() || !paycheckAllocation || selectedCats.length === 0) return;
onSave({
name: name.trim(), icon: icon || name.charAt(0),
categories: selectedCats, category: selectedCats[0],
monthlyAllocation: derivedMonthlyAllocation,
paycheckAllocation: parseFloat(paycheckAllocation) || 0,
});
}

return (
<BottomSheet title={editing ? “Edit Envelope” : “New Envelope”} onClose={onClose}>
<div style={{ marginBottom: 14 }}>
<label style={S.label}>Envelope Name & Icon</label>
<div style={{ display: “flex”, alignItems: “center”, gap: 10 }}>
<input style={{ …S.input, flex: 1, fontSize: 17 }} value={name} onChange={e => setName(e.target.value)} placeholder=“e.g. Gas Fund, Grocery Fund” />
<input
style={{ width: 56, height: 48, background: “#f0ede8”, border: “1px solid #ddd8d0”, color: “#2a2520”, borderRadius: 8, fontSize: 22, textAlign: “center”, fontFamily: “inherit”, flexShrink: 0, boxSizing: “border-box” }}
value={icon}
onChange={e => {
const val = e.target.value;
if (!val) { setIcon(””); return; }
if (typeof Intl !== “undefined” && Intl.Segmenter) {
const segs = […new Intl.Segmenter().segment(val)];
setIcon(segs[segs.length - 1].segment);
} else { setIcon([…val][[…val].length - 1] || “”); }
}}
placeholder=“emoji” inputMode=“text” />
</div>
</div>
<div style={{ marginBottom: 20 }}>
<label style={S.label}>Track spending from categories</label>
<div style={{ display: “flex”, flexWrap: “wrap”, gap: 8, marginBottom: 10 }}>
{categories.map(cat => {
const selected = selectedCats.includes(cat.name);
return (
<button key={cat.name} onClick={() => toggleCat(cat.name)}
style={{ padding: “7px 12px”, borderRadius: 20, border: “1px solid”, borderColor: selected ? cat.color : “#ddd8d0”, background: selected ? cat.color + “22” : cat.color + “0f”, color: selected ? cat.color : “#7a736a”, fontSize: 12, cursor: “pointer”, fontFamily: “inherit” }}>
{cat.icon} {cat.name}
</button>
);
})}
</div>
</div>
<div style={{ marginBottom: 14, padding: “12px 14px”, background: “#f0ede8”, borderRadius: 8, border: “1px solid #ddd8d0” }}>
<div style={{ fontSize: 11, letterSpacing: 2, textTransform: “uppercase”, fontFamily: “‘Righteous’, cursive”, color: “#9a9088”, marginBottom: 6 }}>Monthly Cap (from Budgets tab)</div>
<div style={{ fontSize: 22, color: “#2e9e5e”, fontWeight: “bold” }}>${derivedMonthlyAllocation.toLocaleString()}</div>
</div>
<div style={{ marginBottom: 20 }}>
<label style={S.label}>Per-Paycheck Allocation ($)</label>
<input style={S.input} type=“number” value={paycheckAllocation} onChange={e => setPaycheckAllocation(e.target.value)} placeholder=“e.g. 50” />
</div>
<div style={{ display: “flex”, gap: 10 }}>
<button onClick={handleSave} style={{ flex: 1, padding: 14, background: “#e07b54”, border: “none”, borderRadius: 10, color: “#f5f3ef”, fontSize: 14, fontWeight: “bold”, cursor: “pointer”, fontFamily: “inherit” }}>
{editing ? “Update Envelope” : “Create Envelope”}
</button>
<button onClick={onClose} style={{ padding: “14px 20px”, background: “transparent”, border: “1px solid #ddd8d0”, borderRadius: 10, color: “#7a736a”, fontSize: 14, cursor: “pointer”, fontFamily: “inherit” }}>Cancel</button>
</div>
</BottomSheet>
);
}

function PayScheduleModal({ schedule, onSave, onClose }) {
const editing = !!schedule;
const [amount, setAmount] = useState(schedule ? String(schedule.amount || “”) : “”);
const [frequency, setFrequency] = useState(schedule ? schedule.frequency || “biweekly” : “biweekly”);
const [firstPayDate, setFirstPayDate] = useState(schedule ? schedule.firstPayDate || “” : “”);
const [customDays, setCustomDays] = useState(schedule ? String(schedule.customDays || 14) : “14”);
const [startDate, setStartDate] = useState(schedule ? schedule.startDate || “” : “”);
const [endDate, setEndDate] = useState(schedule ? schedule.endDate || “” : “”);

function handleSave() {
if (!amount || isNaN(parseFloat(amount)) || !firstPayDate) return;
onSave({ amount: parseFloat(amount), frequency, firstPayDate, customDays: parseInt(customDays) || 14, startDate, endDate });
}

return (
<BottomSheet title={editing ? “Edit Pay Schedule” : “New Pay Schedule”} onClose={onClose}>
<div style={{ marginBottom: 14 }}>
<label style={S.label}>Take-Home Amount ($)</label>
<input style={S.input} type=“number” value={amount} onChange={e => setAmount(e.target.value)} placeholder=“e.g. 1500” />
</div>
<div style={{ marginBottom: 14 }}>
<label style={S.label}>Pay Frequency</label>
<div style={{ display: “flex”, flexWrap: “wrap”, gap: 8 }}>
{[[“biweekly”,“Every 2 weeks”],[“semimonthly”,“1st & 15th”],[“monthly”,“Monthly”],[“weekly”,“Weekly”],[“custom”,“Custom”]].map(([id, label]) => (
<button key={id} onClick={() => setFrequency(id)}
style={{ padding: “7px 12px”, borderRadius: 20, border: “1px solid”, borderColor: frequency === id ? “#e07b54” : “#ddd8d0”, background: frequency === id ? “#e07b5422” : “transparent”, color: frequency === id ? “#e07b54” : “#7a736a”, fontSize: 12, cursor: “pointer”, fontFamily: “inherit” }}>
{label}
</button>
))}
</div>
{frequency === “custom” && (
<div style={{ marginTop: 8 }}>
<label style={S.label}>Every how many days?</label>
<input style={S.input} type=“number” value={customDays} onChange={e => setCustomDays(e.target.value)} placeholder=“e.g. 10” />
</div>
)}
</div>
<div style={{ marginBottom: 14 }}>
<label style={S.label}>First Paycheck Date</label>
<input style={S.input} type=“date” value={firstPayDate} onChange={e => setFirstPayDate(e.target.value)} />
</div>
<div style={{ marginBottom: 14 }}>
<label style={S.label}>Schedule Start Date (optional)</label>
<input style={S.input} type=“date” value={startDate} onChange={e => setStartDate(e.target.value)} />
<div style={{ fontSize: 11, color: “#9a9088”, marginTop: 6 }}>Leave blank to use from the first paycheck date.</div>
</div>
<div style={{ marginBottom: 20 }}>
<label style={S.label}>Schedule End Date (optional)</label>
<input style={S.input} type=“date” value={endDate} onChange={e => setEndDate(e.target.value)} />
<div style={{ fontSize: 11, color: “#9a9088”, marginTop: 6 }}>Leave blank if this schedule is still active.</div>
</div>
<div style={{ display: “flex”, gap: 10 }}>
<button onClick={handleSave} style={{ flex: 1, padding: 14, background: “#e07b54”, border: “none”, borderRadius: 10, color: “#f5f3ef”, fontSize: 14, fontWeight: “bold”, cursor: “pointer”, fontFamily: “inherit” }}>
{editing ? “Update Schedule” : “Add Schedule”}
</button>
<button onClick={onClose} style={{ padding: “14px 20px”, background: “transparent”, border: “1px solid #ddd8d0”, borderRadius: 10, color: “#7a736a”, fontSize: 14, cursor: “pointer”, fontFamily: “inherit” }}>Cancel</button>
</div>
</BottomSheet>
);
}

function BonusAllocModal({ paycheck, funds, onConfirm, onClose }) {
const [allocations, setAllocations] = useState(
paycheck.bonusAllocations || funds.map(f => ({ fundId: f.id, amount: “” }))
);
const totalAlloc = allocations.reduce((s, a) => s + (parseFloat(a.amount) || 0), 0);
const unallocated = (paycheck.amount || 0) - totalAlloc;

function updateAlloc(fundId, val) {
setAllocations(prev => prev.map(a => a.fundId === fundId ? { …a, amount: val } : a));
}

function handleConfirm() {
const cleaned = allocations.filter(a => parseFloat(a.amount) > 0).map(a => ({ fundId: a.fundId, amount: parseFloat(a.amount) }));
onConfirm(paycheck.id, cleaned, Math.max(unallocated, 0));
}

return (
<BottomSheet title="Allocate Bonus Pay" onClose={onClose}>
<div style={{ marginBottom: 16, padding: “12px 14px”, background: “#f0ede8”, borderRadius: 8 }}>
<div style={{ fontSize: 11, letterSpacing: 2, textTransform: “uppercase”, fontFamily: “‘Righteous’, cursive”, color: “#9a9088”, marginBottom: 4 }}>Total Bonus</div>
<div style={{ fontSize: 22, fontWeight: “bold”, color: “#2a2520” }}>{new Intl.NumberFormat(“en-US”, { style: “currency”, currency: “USD”, minimumFractionDigits: 2 }).format(paycheck.amount)}</div>
<div style={{ fontSize: 11, color: “#9a9088”, marginTop: 4 }}>{paycheck.label} · {paycheck.date}</div>
</div>
<div style={{ fontSize: 11, color: “#9a9088”, marginBottom: 12 }}>Allocate to envelopes. Any unallocated amount will go to Surplus after confirmation.</div>
{funds.map(fund => {
const alloc = allocations.find(a => a.fundId === fund.id) || { amount: “” };
return (
<div key={fund.id} style={{ display: “flex”, alignItems: “center”, gap: 10, marginBottom: 10 }}>
<span style={{ fontSize: 18, flexShrink: 0 }}>{fund.icon}</span>
<span style={{ flex: 1, fontSize: 13, color: “#2a2520” }}>{fund.name}</span>
<input type=“number” value={alloc.amount}
onChange={e => updateAlloc(fund.id, e.target.value)}
placeholder=“0.00”
style={{ width: 90, background: “#f0ede8”, border: “1px solid #ddd8d0”, color: “#2a2520”, padding: “8px 10px”, borderRadius: 8, fontSize: 14, fontFamily: “inherit”, textAlign: “right” }} />
</div>
);
})}
<div style={{ display: “flex”, justifyContent: “space-between”, paddingTop: 10, borderTop: “1px solid #ddd8d0”, marginBottom: 16, fontSize: 13 }}>
<span style={{ color: “#9a9088” }}>Unallocated → Surplus</span>
<span style={{ color: unallocated < 0 ? “#c94040” : “#f4c430”, fontWeight: “bold” }}>
{new Intl.NumberFormat(“en-US”, { style: “currency”, currency: “USD”, minimumFractionDigits: 2 }).format(Math.max(unallocated, 0))}
</span>
</div>
<div style={{ display: “flex”, gap: 10 }}>
<button onClick={handleConfirm} disabled={unallocated < 0}
style={{ flex: 1, padding: 14, background: unallocated < 0 ? “#ddd8d0” : “#2e9e5e”, border: “none”, borderRadius: 10, color: “#f5f3ef”, fontSize: 14, fontWeight: “bold”, cursor: unallocated < 0 ? “not-allowed” : “pointer”, fontFamily: “inherit” }}>
{unallocated < 0 ? “Over by “ + new Intl.NumberFormat(“en-US”, { style: “currency”, currency: “USD”, minimumFractionDigits: 2 }).format(Math.abs(unallocated)) : “Confirm Allocation”}
</button>
<button onClick={onClose} style={{ padding: “14px 20px”, background: “transparent”, border: “1px solid #ddd8d0”, borderRadius: 10, color: “#7a736a”, fontSize: 14, cursor: “pointer”, fontFamily: “inherit” }}>Cancel</button>
</div>
</BottomSheet>
);
}

function SurplusModal({ fund, surplusBalance, onMove, onClose }) {
const [amount, setAmount] = useState(””);
const amtNum = parseFloat(amount) || 0;
const fmt2 = n => new Intl.NumberFormat(“en-US”, { style: “currency”, currency: “USD”, minimumFractionDigits: 2 }).format(n);

function handleMove() {
if (!amtNum || amtNum > surplusBalance) return;
onMove(fund.id, amtNum);
}

return (
<BottomSheet title={“Move from Surplus → “ + fund.name} onClose={onClose}>
<div style={{ marginBottom: 16, padding: “12px 14px”, background: “#f0ede8”, borderRadius: 8, display: “flex”, justifyContent: “space-between” }}>
<div>
<div style={{ fontSize: 11, letterSpacing: 2, textTransform: “uppercase”, fontFamily: “‘Righteous’, cursive”, color: “#9a9088”, marginBottom: 2 }}>Surplus Available</div>
<div style={{ fontSize: 20, fontWeight: “bold”, color: “#f4c430” }}>{fmt2(surplusBalance)}</div>
</div>
<div style={{ textAlign: “right” }}>
<div style={{ fontSize: 11, letterSpacing: 2, textTransform: “uppercase”, fontFamily: “‘Righteous’, cursive”, color: “#9a9088”, marginBottom: 2 }}>Destination</div>
<div style={{ fontSize: 16, fontWeight: “bold”, color: “#2a2520” }}>{fund.icon} {fund.name}</div>
</div>
</div>
<div style={{ marginBottom: 20 }}>
<label style={S.label}>Amount to Move ($)</label>
<input style={S.input} type=“number” value={amount} onChange={e => setAmount(e.target.value)} placeholder=“0.00” />
{amtNum > surplusBalance && <div style={{ fontSize: 11, color: “#c94040”, marginTop: 4 }}>Exceeds available Surplus balance</div>}
</div>
<div style={{ fontSize: 11, color: “#9a9088”, marginBottom: 16 }}>This will create two transactions: a debit from Surplus and a credit to {fund.name}.</div>
<div style={{ display: “flex”, gap: 10 }}>
<button onClick={handleMove} disabled={!amtNum || amtNum > surplusBalance}
style={{ flex: 1, padding: 14, background: (!amtNum || amtNum > surplusBalance) ? “#ddd8d0” : “#f4c430”, border: “none”, borderRadius: 10, color: (!amtNum || amtNum > surplusBalance) ? “#9a9088” : “#2a2520”, fontSize: 14, fontWeight: “bold”, cursor: (!amtNum || amtNum > surplusBalance) ? “not-allowed” : “pointer”, fontFamily: “inherit” }}>
Move {amtNum ? fmt2(amtNum) : “”} to {fund.name}
</button>
<button onClick={onClose} style={{ padding: “14px 20px”, background: “transparent”, border: “1px solid #ddd8d0”, borderRadius: 10, color: “#7a736a”, fontSize: 14, cursor: “pointer”, fontFamily: “inherit” }}>Cancel</button>
</div>
</BottomSheet>
);
}

export default function App() {
const [data, setData] = useState(() => {
try {
const saved = localStorage.getItem(STORAGE_KEY);
const parsed = saved ? JSON.parse(saved) : DEFAULT_DATA;
const migratedCategories = (parsed.categories || DEFAULT_CATEGORIES).map(cat => {
const allAscii = cat.icon && […cat.icon].every(c => c.charCodeAt(0) < 128);
if (allAscii) { const def = DEFAULT_CATEGORIES.find(d => d.name === cat.name); return def ? { …cat, icon: def.icon } : cat; }
return cat;
});
// Migrate paySchedule → paySchedules
let paySchedules = parsed.paySchedules || [];
if (paySchedules.length === 0 && parsed.paySchedule && parsed.paySchedule.firstPayDate) {
paySchedules = [{ id: 1, amount: parsed.paySchedule.amount || 0, frequency: parsed.paySchedule.frequency || “biweekly”, firstPayDate: parsed.paySchedule.firstPayDate, customDays: parsed.paySchedule.customDays || 14, startDate: “”, endDate: “” }];
}
// Ensure Surplus category exists
const hasSurplus = migratedCategories.some(c => c.name === “Surplus”);
const finalCategories = hasSurplus ? migratedCategories : […migratedCategories, SURPLUS_CAT];
return { …DEFAULT_DATA, …parsed, categories: finalCategories, accounts: parsed.accounts || DEFAULT_ACCOUNTS, defaultAccount: parsed.defaultAccount || “Main”, paySchedule: parsed.paySchedule || DEFAULT_DATA.paySchedule, paySchedules };
} catch (e) { return DEFAULT_DATA; }
});

const [view, setView] = useState(“dashboard”);
const [filterMonth, setFilterMonth] = useState(getMonthKey(new Date()));
const [editingId, setEditingId] = useState(null);
const [toast, setToast] = useState(null);
const [budgetForm, setBudgetForm] = useState({});
const [budgetSort, setBudgetSort] = useState(“custom”);
const [showBudgetWarning, setShowBudgetWarning] = useState(false);
const [accountSort, setAccountSort] = useState(“custom”);
const [catsExpanded, setCatsExpanded] = useState(false);
const [accountsExpanded, setAccountsExpanded] = useState(false);
const [payScheduleExpanded, setPayScheduleExpanded] = useState(false);
const [paycheckLogExpanded, setPaycheckLogExpanded] = useState(false);
const [paycheckLogYear, setPaycheckLogYear] = useState(String(new Date().getFullYear()));
const [spendFilterMode, setSpendFilterMode] = useState(“month”);
const [spendYears, setSpendYears] = useState([String(new Date().getFullYear())]);
const [spendMonths, setSpendMonths] = useState([getMonthKey(new Date())]);
const [spendCats, setSpendCats] = useState([]);
const [spendReconciled, setSpendReconciled] = useState(“all”);
const [spendFiltersExpanded, setSpendFiltersExpanded] = useState(false);
const [expandedFund, setExpandedFund] = useState(null);
const [selectedFundMonth, setSelectedFundMonth] = useState({});
const [showCatModal, setShowCatModal] = useState(false);
const [showAcctModal, setShowAcctModal] = useState(false);
const [showFundModal, setShowFundModal] = useState(false);
const [showPaycheckModal, setShowPaycheckModal] = useState(false);
const [showPayScheduleModal, setShowPayScheduleModal] = useState(false);
const [editingPaySchedule, setEditingPaySchedule] = useState(null);
const [showSurplusModal, setShowSurplusModal] = useState(false);
const [surplusTargetFund, setSurplusTargetFund] = useState(null);
const [showBonusAllocModal, setShowBonusAllocModal] = useState(false);
const [pendingBonusAlloc, setPendingBonusAlloc] = useState(null);
const [showAddSheet, setShowAddSheet] = useState(false);
const [editingCat, setEditingCat] = useState(null);
const [editingAcct, setEditingAcct] = useState(null);
const [editingFund, setEditingFund] = useState(null);
const [editingPaycheck, setEditingPaycheck] = useState(null);

const categories = data.categories || DEFAULT_CATEGORIES;
const accounts = data.accounts || DEFAULT_ACCOUNTS;
const defaultAccount = data.defaultAccount || (accounts[0] ? accounts[0].name : “Main”);

const [form, setForm] = useState({ amount: “”, location: “”, description: “”, category: “”, account: defaultAccount, date: today() });

useEffect(() => {
const link = document.createElement(“link”);
link.rel = “stylesheet”;
link.href = “https://fonts.googleapis.com/css2?family=Righteous&family=Nunito:wght@400;600;700;800&display=swap”;
document.head.appendChild(link);
}, []);

useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {} }, [data]);
useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

function getCat(name) { return categories.find(c => c.name === name) || { name, icon: “?”, color: “#a0a0a0” }; }

const monthExpenses = data.expenses.filter(e => getMonthKey(e.date) === filterMonth);
const totalSpent = monthExpenses.reduce((s, e) => s + e.amount, 0);
const totalBudget = Object.values(data.budgets).reduce((s, v) => s + v, 0);

const ytdStats = (() => {
const todayStr = today();
const yr = new Date().getFullYear();
const schedules = data.paySchedules || [];
const hasSchedules = schedules.length > 0;
const legacySchedule = data.paySchedule || {};
if (!hasSchedules && !legacySchedule.amount) return null;

```
// Scheduled income: walk all schedule dates up to today
let scheduledReceived = 0;
if (hasSchedules) {
  schedules.forEach(s => {
    const dates = getScheduleDates(s, yr);
    dates.forEach(d => {
      const ds = d.toISOString().split("T")[0];
      if (ds <= todayStr) scheduledReceived += s.amount || 0;
    });
  });
} else if (legacySchedule.firstPayDate) {
  const allDates = getPaycheckDates(yr);
  const count = allDates.filter(d => d.toISOString().split("T")[0] <= todayStr).length;
  scheduledReceived = count * (legacySchedule.amount || 0);
}

// Manual paychecks are additive (bonuses etc)
const manualYtd = data.paychecks.filter(p => p.date.startsWith(String(yr)) && p.date <= todayStr).reduce((s, p) => s + p.amount, 0);
const ytdReceived = scheduledReceived + manualYtd;
const ytdSpent = data.expenses.filter(e => e.date.startsWith(String(yr)) && e.date <= todayStr).reduce((s, e) => s + e.amount, 0);
return { ytdReceived, ytdSpent, ytdUnspent: ytdReceived - ytdSpent };
```

})();

function expenseAmountForCat(e, catName) {
if (e.splits && e.splits.length > 0) return e.splits.filter(s => s.category === catName).reduce((s, sp) => s + sp.amount, 0);
return e.category === catName ? e.amount : 0;
}
function expenseMatchesCat(e, catName) {
if (e.splits && e.splits.length > 0) return e.splits.some(s => s.category === catName);
return e.category === catName;
}
const spendingByCategory = categories.map(cat => {
const spent = monthExpenses.reduce((s, e) => s + expenseAmountForCat(e, cat.name), 0);
const budget = data.budgets[cat.name] || 0;
return { …cat, spent, budget, pct: budget > 0 ? Math.min((spent / budget) * 100, 100) : 0 };
});

const last6Months = Array.from({ length: 6 }, (_, i) => {
const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
const key = getMonthKey(d);
const total = data.expenses.filter(e => getMonthKey(e.date) === key).reduce((s, e) => s + e.amount, 0);
return { month: d.toLocaleString(“default”, { month: “short” }), total };
});

const pieData = spendingByCategory.filter(c => c.spent > 0).map(c => ({ name: c.name, value: c.spent, color: c.color }));

function resetForm() { setForm({ amount: “”, location: “”, description: “”, category: “”, account: defaultAccount, date: today(), isSplit: false, splits: [{ category: “”, amount: “” }, { category: “”, amount: “” }], reconciled: false }); }

function addExpense() {
const amt = parseFloat(form.amount);
if (!amt || isNaN(amt)) return;
if (form.isSplit) {
if (form.splits.length < 2) return;
const splitTotal = form.splits.reduce((s, sp) => s + (parseFloat(sp.amount) || 0), 0);
if (Math.abs(splitTotal - amt) > 0.01) return;
if (form.splits.some(sp => !sp.category)) return;
} else {
if (!form.category) return;
}
const expense = {
id: Date.now(), amount: amt, location: form.location, description: form.description,
account: form.account, date: form.date, reconciled: form.reconciled || false,
…(form.isSplit
? { splits: form.splits.map(sp => ({ category: sp.category, amount: parseFloat(sp.amount) })), category: form.splits[0].category }
: { category: form.category, splits: null }),
};
if (editingId) {
setData(d => ({ …d, expenses: d.expenses.map(e => e.id === editingId ? { …expense, id: editingId } : e) }));
setEditingId(null); setToast(“Updated! ✏️”);
} else {
setData(d => ({ …d, expenses: [expense, …d.expenses] }));
setToast(“Logged! 💸”);
}
resetForm(); setShowAddSheet(false); setView(“expenses”);
}

function deleteExpense(id) { setData(d => ({ …d, expenses: d.expenses.filter(e => e.id !== id) })); setToast(“Poof! Gone 🗑️”); }
function editExpense(e) {
const isSplit = !!(e.splits && e.splits.length > 0);
setForm({
amount: String(e.amount), location: e.location || “”, description: e.description || “”,
category: isSplit ? “” : (e.category || “”), account: e.account, date: e.date,
reconciled: e.reconciled || false, isSplit,
splits: isSplit ? e.splits.map(s => ({ category: s.category, amount: String(s.amount) })) : [{ category: “”, amount: “” }, { category: “”, amount: “” }],
});
setEditingId(e.id); setShowAddSheet(true);
}

function saveBudgets() {
const merged = { …data.budgets };
Object.entries(budgetForm).forEach(([k, v]) => { merged[k] = parseFloat(v) || 0; });
setData(d => ({ …d, budgets: merged })); setBudgetForm({}); setToast(“Budgets locked in 🎯”);
}

function saveCat(fields) {
if (editingCat) {
const old = editingCat.name;
setData(d => ({
…d,
categories: d.categories.map(c => c.name === old ? { …c, …fields } : c),
budgets: fields.name !== old ? Object.fromEntries(Object.entries(d.budgets).map(([k, v]) => [k === old ? fields.name : k, v])) : d.budgets,
expenses: fields.name !== old ? d.expenses.map(e => e.category === old ? { …e, category: fields.name } : e) : d.expenses,
funds: fields.name !== old ? d.funds.map(f => f.category === old ? { …f, category: fields.name } : f) : d.funds,
}));
setToast(“Updated! 🎨”);
} else {
setData(d => ({ …d, categories: […d.categories, fields] })); setToast(“Category added 🎨”);
}
setEditingCat(null); setShowCatModal(false);
}

function deleteCat(name) { setData(d => ({ …d, categories: d.categories.filter(c => c.name !== name) })); setToast(“Category zapped 🎨”); }

function saveAcct(fields) {
if (editingAcct) {
const old = editingAcct.name;
setData(d => ({
…d,
accounts: d.accounts.map(a => a.id === editingAcct.id ? { …a, …fields } : a),
expenses: fields.name !== old ? d.expenses.map(e => e.account === old ? { …e, account: fields.name } : e) : d.expenses,
defaultAccount: d.defaultAccount === old ? fields.name : d.defaultAccount,
}));
setToast(“Updated! 🏦”);
} else {
setData(d => ({ …d, accounts: […d.accounts, { id: Date.now(), …fields }] })); setToast(“Account added 🏦”);
}
setEditingAcct(null); setShowAcctModal(false);
}

function deleteAcct(id, name) {
setData(d => ({
…d,
accounts: d.accounts.filter(a => a.id !== id),
defaultAccount: d.defaultAccount === name && d.accounts.length > 1 ? (d.accounts.find(a => a.id !== id) || {}).name || “” : d.defaultAccount,
}));
setToast(“Account removed 🏦”);
}

function setDefaultAcct(name) { setData(d => ({ …d, defaultAccount: name })); setToast(name + “ is your go-to now ⭐”); }

function savePaySchedule(fields) {
if (editingPaySchedule) {
setData(d => ({ …d, paySchedules: d.paySchedules.map(s => s.id === editingPaySchedule.id ? { …s, …fields } : s) }));
setToast(“Schedule updated! 📅”);
} else {
setData(d => ({ …d, paySchedules: […(d.paySchedules || []), { id: Date.now(), …fields }] }));
setToast(“Schedule added! 📅”);
}
setEditingPaySchedule(null); setShowPayScheduleModal(false);
}

function deletePaySchedule(id) {
setData(d => ({ …d, paySchedules: d.paySchedules.filter(s => s.id !== id) }));
setToast(“Schedule removed 📅”);
}

function confirmBonusAlloc(paycheckId, allocations, unallocated) {
// allocations: [{ fundId, amount }]
// Create Surplus expense for unallocated portion
const paycheck = data.paychecks.find(p => p.id === paycheckId);
if (!paycheck) return;
const newExpenses = [];
if (unallocated > 0.01) {
newExpenses.push({ id: Date.now(), amount: unallocated, location: “Bonus Pay”, description: paycheck.label + “ — unallocated”, category: “Surplus”, account: data.defaultAccount, date: paycheck.date, reconciled: false, splits: null });
}
// Store allocations on paycheck
setData(d => ({
…d,
paychecks: d.paychecks.map(p => p.id === paycheckId ? { …p, bonusAllocations: allocations } : p),
expenses: […d.expenses, …newExpenses],
}));
setShowBonusAllocModal(false); setPendingBonusAlloc(null);
setToast(“Bonus allocated! 💰”);
}

function moveSurplusToEnvelope(fundId, amount) {
const fund = data.funds.find(f => f.id === fundId);
if (!fund || amount <= 0) return;
const todayDate = today();
const surplusOut = { id: Date.now(), amount: -Math.abs(amount), location: “Surplus Transfer”, description: “Moved to “ + fund.name, category: “Surplus”, account: data.defaultAccount, date: todayDate, reconciled: false, splits: null };
const fundIn = { id: Date.now() + 1, amount: Math.abs(amount), location: “Surplus Transfer”, description: “From Surplus”, category: (Array.isArray(fund.categories) ? fund.categories[0] : fund.category) || “Surplus”, account: data.defaultAccount, date: todayDate, reconciled: false, splits: null, surplusTransfer: true };
setData(d => ({ …d, expenses: […d.expenses, surplusOut, fundIn] }));
setShowSurplusModal(false); setSurplusTargetFund(null);
setToast(“Moved to “ + fund.name + “ 📬”);
}

function savePaycheck(fields) {
if (editingPaycheck) {
setData(d => ({ …d, paychecks: d.paychecks.map(p => p.id === editingPaycheck.id ? { …p, …fields } : p) }));
setToast(“Updated! 💰”);
} else {
setData(d => ({ …d, paychecks: [{ id: Date.now(), …fields }, …d.paychecks] })); setToast(“Cha-ching! 💰”);
}
setEditingPaycheck(null); setShowPaycheckModal(false);
}

function deletePaycheck(id) { setData(d => ({ …d, paychecks: d.paychecks.filter(p => p.id !== id) })); setToast(“Paycheck removed 💰”); }

function saveFund(fields) {
if (editingFund) {
setData(d => ({ …d, funds: d.funds.map(f => f.id === editingFund.id ? { …f, …fields } : f) })); setToast(“Updated! 📬”);
} else {
setData(d => ({ …d, funds: […d.funds, { id: Date.now(), …fields }] })); setToast(“Envelope ready 📬”);
}
setEditingFund(null); setShowFundModal(false);
}

function deleteFund(id) { setData(d => ({ …d, funds: d.funds.filter(f => f.id !== id) })); setToast(“Envelope gone 📬”); }

// Get scheduled paycheck dates for a single schedule within a year
function getScheduleDates(schedule, year) {
if (!schedule || !schedule.firstPayDate) return [];
const freq = schedule.frequency || “biweekly”;
const firstDate = new Date(schedule.firstPayDate + “T00:00:00”);
const dates = [];
const yearStart = new Date(year + “-01-01T00:00:00”);
const yearEnd = new Date(year + “-12-31T00:00:00”);
// Respect schedule start/end dates
const schedStart = schedule.startDate ? new Date(schedule.startDate + “T00:00:00”) : firstDate;
const schedEnd = schedule.endDate ? new Date(schedule.endDate + “T00:00:00”) : yearEnd;
const effectiveStart = schedStart > yearStart ? schedStart : yearStart;
const effectiveEnd = schedEnd < yearEnd ? schedEnd : yearEnd;
if (effectiveStart > effectiveEnd) return [];
if (freq === “semimonthly”) {
for (let m = 0; m < 12; m++) {
const d1 = new Date(year, m, 1), d2 = new Date(year, m, 15);
if (d1 >= effectiveStart && d1 <= effectiveEnd) dates.push(d1);
if (d2 >= effectiveStart && d2 <= effectiveEnd) dates.push(d2);
}
return dates;
}
if (freq === “monthly”) {
const dayOfMonth = firstDate.getDate();
for (let m = 0; m < 12; m++) { const d = new Date(year, m, dayOfMonth); if (d >= effectiveStart && d <= effectiveEnd) dates.push(d); }
return dates;
}
const intervalDays = freq === “weekly” ? 7 : freq === “custom” ? (schedule.customDays || 14) : 14;
let cursor = new Date(firstDate);
while (cursor < effectiveStart) cursor = new Date(cursor.getTime() + intervalDays * 86400000);
while (cursor <= effectiveEnd) { dates.push(new Date(cursor)); cursor = new Date(cursor.getTime() + intervalDays * 86400000); }
return dates;
}

// Get all scheduled paycheck dates across all schedules for a year
function getPaycheckDates(year) {
const schedules = data.paySchedules || [];
if (schedules.length === 0) {
// Fallback to legacy single paySchedule
return getScheduleDates({ …data.paySchedule, startDate: “”, endDate: “” }, year);
}
const allDates = [];
schedules.forEach(s => getScheduleDates(s, year).forEach(d => allDates.push({ date: d, schedule: s })));
allDates.sort((a, b) => a.date - b.date);
return allDates.map(x => x.date);
}

// Get scheduled income for a date range (for budget warning)
function getScheduledMonthlyIncome() {
const schedules = data.paySchedules || [];
if (schedules.length === 0) {
const s = data.paySchedule || {};
if (!s.amount) return null;
const freq = s.frequency || “biweekly”;
if (freq === “weekly”) return s.amount * 52 / 12;
if (freq === “biweekly”) return s.amount * 26 / 12;
if (freq === “semimonthly”) return s.amount * 2;
if (freq === “monthly”) return s.amount;
if (freq === “custom”) return s.amount * (365 / (s.customDays || 14)) / 12;
return s.amount * 26 / 12;
}
// Use currently active schedule
const todayStr = today();
const active = schedules.find(s => {
const start = s.startDate || “0000-01-01”;
const end = s.endDate || “9999-12-31”;
return todayStr >= start && todayStr <= end;
}) || schedules[schedules.length - 1];
if (!active || !active.amount) return null;
const freq = active.frequency || “biweekly”;
if (freq === “weekly”) return active.amount * 52 / 12;
if (freq === “biweekly”) return active.amount * 26 / 12;
if (freq === “semimonthly”) return active.amount * 2;
if (freq === “monthly”) return active.amount;
if (freq === “custom”) return active.amount * (365 / (active.customDays || 14)) / 12;
return active.amount * 26 / 12;
}

function computeFundMonths(fund, year) {
const fundCats = Array.isArray(fund.categories) ? fund.categories : (fund.category ? [fund.category] : []);
const monthlyAlloc = fundCats.reduce((sum, cn) => sum + (data.budgets[cn] || 0), 0);
const paycheckAlloc = fund.paycheckAllocation || fund.allocation || 0;
const allPaycheckDates = getPaycheckDates(year);
const todayStr = today();
const months = [];
let carryover = 0;

```
for (let m = 0; m < 12; m++) {
  const monthKey = year + "-" + String(m + 1).padStart(2, "0");
  const monthEnd = new Date(year, m + 1, 0);
  const monthEndStr = monthEnd.toISOString().split("T")[0];
  const isCurrentMonth = monthKey === getMonthKey(new Date());
  const isInPast = monthEndStr < todayStr.slice(0, 10) || (!isCurrentMonth && monthEndStr <= todayStr);
  const isActive = isInPast || isCurrentMonth;

  const scheduleDatesThisMonth = allPaycheckDates.filter(d => {
    const ds = d.toISOString().split("T")[0];
    return ds >= monthKey + "-01" && ds <= monthEndStr && ds <= todayStr;
  });
  const scheduleFunded = scheduleDatesThisMonth.length * paycheckAlloc;
  const scheduleDateStrs = new Set(scheduleDatesThisMonth.map(d => d.toISOString().split("T")[0]));
  const bonusFunded = data.paychecks
    .filter(p => getMonthKey(p.date) === monthKey && p.date <= todayStr && !scheduleDateStrs.has(p.date))
    .reduce((sum, p) => {
      if (p.customAlloc && p.customAlloc[fund.id] !== undefined) return sum + (p.customAlloc[fund.id] || 0);
      return sum + paycheckAlloc;
    }, 0);
  const funded = scheduleFunded + bonusFunded;
  const totalAvailable = carryover + funded;
  const spent = isActive ? data.expenses.filter(e => getMonthKey(e.date) === monthKey).reduce((s, e) => {
    if (e.splits && e.splits.length > 0) return s + e.splits.filter(sp => fundCats.includes(sp.category)).reduce((ss, sp) => ss + sp.amount, 0);
    return fundCats.includes(e.category) ? s + e.amount : s;
  }, 0) : 0;
  const usableThisMonth = Math.min(totalAvailable, monthlyAlloc);
  const excess = Math.max(totalAvailable - monthlyAlloc, 0);
  const balance = isActive ? (usableThisMonth - spent) : null;

  if (isActive) {
    carryover = isCurrentMonth ? excess : Math.max(balance, 0) + excess;
  } else {
    carryover = excess;
  }

  const spentPct = isActive && monthlyAlloc > 0 ? Math.min((spent / monthlyAlloc) * 100, 100) : 0;
  const preFundedPct = !isActive && monthlyAlloc > 0 ? Math.min((Math.min(totalAvailable, monthlyAlloc) / monthlyAlloc) * 100, 100) : 0;
  const fundingPct = monthlyAlloc > 0 ? Math.min((Math.min(totalAvailable, monthlyAlloc) / monthlyAlloc) * 100, 100) : 0;

  months.push({
    monthKey, label: new Date(year, m, 1).toLocaleString("default", { month: "short" }),
    paycheckCount: scheduleDatesThisMonth.length,
    funded, totalAvailable,
    spent: isActive ? spent : null,
    balance, preFunded: !isActive ? Math.min(totalAvailable, monthlyAlloc) : null,
    monthlyAlloc, isActive, isCurrentMonth,
    pct: spentPct, preFundedPct, fundingPct,
  });
}
return months;
```

}

const sortedAccounts = […accounts].sort((a, b) => accountSort === “alpha” ? a.name.localeCompare(b.name) : 0);
const sortedBudgetCats = […categories].sort((a, b) => {
if (budgetSort === “alpha”) return a.name.localeCompare(b.name);
if (budgetSort === “amount”) return (data.budgets[b.name] || 0) - (data.budgets[a.name] || 0);
return 0;
});

const navItems = [
{ id: “dashboard”, label: “Snapshot”,  icon: PieChartIcon },
{ id: “expenses”,  label: “Spending”,  icon: Wallet },
{ id: “funds”,     label: “Envelopes”, icon: MailOpen },
{ id: “budgets”,   label: “Budgets”,   icon: PiggyBank },
{ id: “settings”,  label: “Settings”,  icon: SettingsIcon },
];

return (
<div style={{ minHeight: “100vh”, background: “#f5f3ef”, color: “#2a2520”, fontFamily: “‘Nunito’, sans-serif”, display: “flex”, flexDirection: “column” }}>

```
  {/* Header */}
  <header style={{ borderBottom: "1px solid #e9d5f5", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg, #fdf2f8 0%, #eef2ff 100%)" }}>
    <div>
      <div style={{ fontSize: 10, letterSpacing: 4, color: "#7a736a", textTransform: "uppercase", marginBottom: 2, fontFamily: "'Righteous', cursive" }}>Your Money 🦄</div>
      <div style={{ fontSize: 22, fontWeight: "bold", letterSpacing: 1, fontFamily: "'Righteous', cursive", background: "linear-gradient(90deg, #ec4899, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "inline-block" }}>Spendicorn</div>
    </div>
    <div style={{ textAlign: "right" }}>
      {ytdStats ? (
        <>
          <div style={{ fontSize: 10, color: "#7a736a", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Righteous', cursive" }}>Unspent YTD</div>
          <div style={{ fontSize: 26, color: ytdStats.ytdUnspent < 0 ? "#c94040" : "#2e9e5e", fontWeight: "bold", lineHeight: 1.1 }}>{fmt(ytdStats.ytdUnspent)}</div>
          <div style={{ fontSize: 11, color: "#9a9088", marginTop: 2 }}>{fmt(totalSpent)} this month</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 10, color: "#7a736a", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Righteous', cursive" }}>Month Total</div>
          <div style={{ fontSize: 26, color: totalSpent > totalBudget ? "#c94040" : "#2e9e5e", fontWeight: "bold", lineHeight: 1.1 }}>{fmt(totalSpent)}</div>
          <div style={{ fontSize: 11, color: "#9a9088", marginTop: 2 }}>of {fmt(totalBudget)}</div>
        </>
      )}
    </div>
  </header>

  {/* Toast */}
  {toast && (
    <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#2e9e5e", color: "#f5f3ef", padding: "10px 24px", borderRadius: 40, fontSize: 13, fontWeight: "bold", zIndex: 999, whiteSpace: "nowrap" }}>
      {toast}
    </div>
  )}

  {/* Modals */}
  {showCatModal      && <CategoryModal  cat={editingCat}            onSave={saveCat}      onClose={() => { setShowCatModal(false);   setEditingCat(null);  }} />}
  {showAcctModal     && <AccountModal   account={editingAcct}       onSave={saveAcct}     onClose={() => { setShowAcctModal(false);  setEditingAcct(null); }} />}
  {showFundModal     && <FundModal      fund={editingFund} categories={categories} budgets={data.budgets} onSave={saveFund} onClose={() => { setShowFundModal(false); setEditingFund(null); }} />}
  {showPaycheckModal && <PaycheckModal  paycheck={editingPaycheck}  funds={data.funds}    onSave={savePaycheck} onClose={() => { setShowPaycheckModal(false); setEditingPaycheck(null); }} />}
  {showPayScheduleModal && <PayScheduleModal schedule={editingPaySchedule} onSave={savePaySchedule} onClose={() => { setShowPayScheduleModal(false); setEditingPaySchedule(null); }} />}
  {showBonusAllocModal && pendingBonusAlloc && <BonusAllocModal paycheck={pendingBonusAlloc} funds={data.funds} onConfirm={confirmBonusAlloc} onClose={() => { setShowBonusAllocModal(false); setPendingBonusAlloc(null); }} />}
  {showSurplusModal && surplusTargetFund && (() => {
    const surplusSpent = data.expenses.filter(e => e.category === "Surplus").reduce((s, e) => s + e.amount, 0);
    return <SurplusModal fund={surplusTargetFund} surplusBalance={surplusSpent} onMove={moveSurplusToEnvelope} onClose={() => { setShowSurplusModal(false); setSurplusTargetFund(null); }} />;
  })()}

  {/* Add/Edit Expense Sheet */}
  {showAddSheet && (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
      <div style={{ width: "100%", maxWidth: 600, margin: "0 auto", background: "#ffffff", borderRadius: "20px 20px 0 0", padding: 24, borderTop: "1px solid #ddd8d0", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#7a736a", marginBottom: 20 }}>
          {editingId ? "Edit Expense" : "New Expense"}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>Amount ($)</label>
          <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" style={S.input} />
        </div>
        <div style={{ marginBottom: 16, position: "relative" }}>
          <label style={S.label}>Location</label>
          <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Walmart, Shell Station" style={S.input} />
          {form.location.trim().length > 0 && (() => {
            const query = form.location.trim().toLowerCase();
            const suggestions = [...new Set(data.expenses.map(e => e.location).filter(l => l && l.toLowerCase().includes(query) && l.toLowerCase() !== query))].slice(0, 5);
            return suggestions.length > 0 ? (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#f0ede8", border: "1px solid #ddd8d0", borderRadius: 8, zIndex: 10, overflow: "hidden", marginTop: 2 }}>
                {suggestions.map(s => (
                  <button key={s} onClick={() => setForm(p => ({ ...p, location: s }))}
                    style={{ width: "100%", padding: "10px 14px", background: "transparent", border: "none", borderBottom: "1px solid #ddd8d0", color: "#2a2520", fontSize: 14, fontFamily: "inherit", textAlign: "left", cursor: "pointer", display: "block" }}>
                    {s}
                  </button>
                ))}
              </div>
            ) : null;
          })()}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>Description</label>
          <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What was this for? Be honest 😅" style={S.input} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>Date</label>
          <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={S.input} />
        </div>
        {/* Category / Split toggle */}
        <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ ...S.label, marginBottom: 0 }}>Category</label>
          <button onClick={() => setForm(p => ({ ...p, isSplit: !p.isSplit }))}
            style={{ fontSize: 11, padding: "4px 12px", borderRadius: 12, border: "1px solid", borderColor: form.isSplit ? "#b07fc7" : "#ddd8d0", background: form.isSplit ? "#b07fc722" : "transparent", color: form.isSplit ? "#b07fc7" : "#9a9088", cursor: "pointer", fontFamily: "inherit" }}>
            ✂️ {form.isSplit ? "Split on" : "Split"}
          </button>
        </div>
        {!form.isSplit ? (
          <div style={{ marginBottom: 16 }}>
            <div style={{ position: "relative" }}>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                style={{ ...S.select, color: form.category ? "#2a2520" : "#9a9088", paddingRight: 36 }}>
                <option value="" disabled>Choose a category</option>
                {sortedBudgetCats.map(cat => <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>)}
              </select>
              <ChevronDown style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            {(() => {
              const amt = parseFloat(form.amount) || 0;
              const splitTotal = form.splits.reduce((s, sp) => s + (parseFloat(sp.amount) || 0), 0);
              const remaining = amt - splitTotal;
              const isBalanced = amt > 0 && Math.abs(remaining) < 0.01;
              return (
                <>
                  {form.splits.map((sp, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                      <div style={{ position: "relative", flex: 1 }}>
                        <select value={sp.category}
                          onChange={e => setForm(p => { const s = [...p.splits]; s[i] = { ...s[i], category: e.target.value }; return { ...p, splits: s }; })}
                          style={{ ...S.select, fontSize: 13, padding: "10px 32px 10px 10px", color: sp.category ? "#2a2520" : "#9a9088" }}>
                          <option value="" disabled>Category</option>
                          {sortedBudgetCats.map(cat => <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>)}
                        </select>
                        <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      </div>
                      <input type="number" value={sp.amount}
                        onChange={e => setForm(p => { const s = [...p.splits]; s[i] = { ...s[i], amount: e.target.value }; return { ...p, splits: s }; })}
                        placeholder="0.00"
                        style={{ width: 90, background: "#f0ede8", border: "1px solid #ddd8d0", color: "#2a2520", padding: "10px", borderRadius: 8, fontSize: 13, fontFamily: "inherit", textAlign: "right" }} />
                      {form.splits.length > 2 && (
                        <button onClick={() => setForm(p => ({ ...p, splits: p.splits.filter((_, j) => j !== i) }))}
                          style={{ background: "transparent", border: "1px solid #c9404044", color: "#c94040", padding: "6px 8px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>✕</button>
                      )}
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                    <button onClick={() => setForm(p => ({ ...p, splits: [...p.splits, { category: "", amount: "" }] }))}
                      style={{ fontSize: 12, background: "transparent", border: "none", color: "#9a9088", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
                      + Add split
                    </button>
                    <span style={{ fontSize: 12, fontWeight: "bold", color: isBalanced ? "#2e9e5e" : amt > 0 ? "#c94040" : "#9a9088" }}>
                      {isBalanced ? "✓ Balanced" : amt > 0 ? (remaining > 0 ? fmt(remaining) + " remaining" : fmt(Math.abs(remaining)) + " over") : "Enter amount first"}
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        )}
        <div style={{ marginBottom: 24 }}>
          <label style={S.label}>Account</label>
          <select value={form.account} onChange={e => setForm(p => ({ ...p, account: e.target.value }))} style={S.select}>
            {sortedAccounts.map(a => <option key={a.id} value={a.name}>{a.name}{a.name === defaultAccount ? " ★" : ""}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={addExpense}
            style={{ flex: 1, padding: 14, background: "#e07b54", border: "none", borderRadius: 10, color: "#f5f3ef", fontSize: 14, fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" }}>
            {editingId ? "Update" : "Add Expense"}
          </button>
          <button onClick={() => { resetForm(); setShowAddSheet(false); setEditingId(null); }}
            style={{ padding: "14px 20px", background: "transparent", border: "1px solid #ddd8d0", borderRadius: 10, color: "#7a736a", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Main Content */}
  <main style={{ flex: 1, padding: "20px 16px", maxWidth: 600, margin: "0 auto", width: "100%", boxSizing: "border-box", paddingBottom: 100 }}>

    {/* SNAPSHOT TAB */}
    {view === "dashboard" && (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
            style={{ background: "#f0ede8", border: "1px solid #ddd8d0", color: "#2a2520", padding: "8px 12px", borderRadius: 8, fontSize: 13, fontFamily: "inherit" }} />
          <span style={{ color: "#9a9088", fontSize: 12 }}>{monthExpenses.length} transactions</span>
        </div>

        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#7a736a" }}>How You're Doing</span>
            <span style={{ fontSize: 13 }}>{totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%</span>
          </div>
          <div style={{ height: 8, background: "#ddd8d0", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: (totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0) + "%", background: totalSpent > totalBudget ? "linear-gradient(90deg, #c94040, #e05555)" : "linear-gradient(90deg, #2e9e5e, #4abf80)", borderRadius: 4 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 11, color: "#9a9088" }}>Spent: {fmt(totalSpent)}</span>
            <span style={{ fontSize: 11, color: "#9a9088" }}>Remaining: {fmt(Math.max(totalBudget - totalSpent, 0))}</span>
          </div>
        </div>

        {data.funds.length > 0 && (
          <div style={S.card}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#7a736a", marginBottom: 12 }}>Your Envelopes</div>
            {data.funds.map(fund => {
              const cat = getCat(fund.category);
              const months = computeFundMonths(fund, new Date().getFullYear());
              const cur = months.find(m => m.isCurrentMonth);
              if (!cur || !cur.isActive) return null;
              const pct = cur.monthlyAlloc > 0 ? Math.min((cur.spent / cur.monthlyAlloc) * 100, 100) : 0;
              return (
                <div key={fund.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13 }}>{fund.icon} {fund.name}</span>
                    <span style={{ fontSize: 12, color: cur.balance < 0 ? "#c94040" : "#7a736a" }}>{fmt(Math.max(cur.balance, 0))} left</span>
                  </div>
                  <div style={{ height: 6, background: "#ddd8d0", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: pct + "%", background: cur.balance < 0 ? "linear-gradient(90deg, #c94040, #e05555)" : "linear-gradient(90deg, " + cat.color + ", " + cat.color + "99)", borderRadius: 3 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: "#9a9088" }}>Spent {fmt(cur.spent)}</span>
                    <span style={{ fontSize: 10, color: "#9a9088" }}>Cap {fmt(cur.monthlyAlloc)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={S.card}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#7a736a", marginBottom: 12 }}>Where It Went</div>
          <div style={{ position: "relative", width: "100%", height: 200 }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                {pieData.length > 0 ? (
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                ) : (
                  <Pie data={[{ name: "", value: 1 }]} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" strokeWidth={0}>
                    <Cell fill="#ede8e0" />
                  </Pie>
                )}
                {pieData.length > 0 && <Tooltip formatter={v => fmt(v)} contentStyle={{ background: "#ffffff", border: "1px solid #ddd8d0", borderRadius: 8, color: "#2a2520", fontSize: 12 }} />}
                {pieData.length > 0 && <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: "#7a736a", fontSize: 11 }}>{v}</span>} />}
              </PieChart>
            </ResponsiveContainer>
            {pieData.length === 0 && (
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
                <div style={{ fontSize: 22, marginBottom: 2 }}>👀</div>
                <div style={{ fontSize: 11, color: "#9a9088", whiteSpace: "nowrap" }}>No spend yet</div>
              </div>
            )}
          </div>
        </div>

        <div style={S.card}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#7a736a", marginBottom: 12 }}>The Big Picture</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={last6Months} barSize={28}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#9a9088", fontSize: 11 }} />
              <YAxis hide />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background: "#ffffff", border: "1px solid #ddd8d0", borderRadius: 8, color: "#2a2520", fontSize: 12 }} />
              <Bar dataKey="total" fill="#e07b54" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={S.card}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#7a736a", marginBottom: 16 }}>Broken Down</div>
          {spendingByCategory.filter(c => c.budget > 0).map(cat => (
            <div key={cat.name} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13 }}>{cat.icon} {cat.name}</span>
                <span style={{ fontSize: 12, color: cat.spent > cat.budget ? "#c94040" : "#7a736a" }}>{fmt(cat.spent)} / {fmt(cat.budget)}</span>
              </div>
              <div style={{ height: 5, background: "#ddd8d0", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: cat.pct + "%", background: cat.spent > cat.budget ? "linear-gradient(90deg, #c94040, #e05555)" : "linear-gradient(90deg, " + cat.color + ", " + cat.color + "99)", borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* SPENDING TAB */}
    {view === "expenses" && (
      <div>
        <button
          onClick={() => { resetForm(); setEditingId(null); setShowAddSheet(true); }}
          style={{ position: "fixed", bottom: 80, right: 20, width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(90deg, #ec4899, #6366f1)", border: "none", color: "#ffffff", fontSize: 28, fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(236,72,153,0.4)", zIndex: 100 }}>
          +
        </button>

        <div style={{ ...S.card, padding: 0, overflow: "hidden", marginBottom: 12 }}>
          <button onClick={() => setSpendFiltersExpanded(p => !p)}
            style={{ width: "100%", padding: "12px 14px", background: "transparent", border: "none", color: "#2a2520", cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#7a736a", flexShrink: 0 }}>Filters</span>
              <span style={{ fontSize: 11, color: "#e07b54", background: "#e07b5415", padding: "2px 8px", borderRadius: 10, border: "1px solid #e07b5433" }}>
                {spendFilterMode === "year" ? "Year" : "Month"}
              </span>
              <span style={{ fontSize: 11, color: "#9a9088" }}>{spendYears.join(", ")}</span>
              {spendFilterMode === "month" && spendMonths.length > 0 && (
                <span style={{ fontSize: 11, color: "#9a9088" }}>
                  {"— " + (spendMonths.length === 1 ? new Date(spendMonths[0] + "-01T00:00:00").toLocaleString("default", { month: "short" }) : spendMonths.length + " months")}
                </span>
              )}
              {spendCats.length > 0 && (
                <span style={{ fontSize: 11, color: "#9a9088" }}>
                  {"— " + (spendCats.length === 1 ? spendCats[0] : spendCats.length + " categories")}
                </span>
              )}
            </div>
            <ChevronDown style={{ transition: "transform 0.25s ease", transform: spendFiltersExpanded ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }} />
          </button>

          {spendFiltersExpanded && (
            <div style={{ borderTop: "1px solid #ddd8d0", padding: 14 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {[["month", "By Month"], ["year", "By Year"]].map(([mode, label]) => (
                  <button key={mode} onClick={() => setSpendFilterMode(mode)}
                    style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid", borderColor: spendFilterMode === mode ? "#e07b54" : "#ddd8d0", background: spendFilterMode === mode ? "#e07b5422" : "transparent", color: spendFilterMode === mode ? "#e07b54" : "#9a9088", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    {label}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#9a9088" }}>Year</div>
                  {spendYears.length > 1 && (
                    <button onClick={() => setSpendYears([String(new Date().getFullYear())])}
                      style={{ fontSize: 10, background: "transparent", border: "none", color: "#9a9088", cursor: "pointer", fontFamily: "inherit" }}>Reset</button>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {Array.from(new Set([...data.expenses.map(e => e.date.slice(0, 4)), String(new Date().getFullYear())])).sort().reverse().map(yr => {
                    const sel = spendYears.includes(yr);
                    return (
                      <button key={yr} onClick={() => {
                        setSpendYears(p => p.includes(yr) ? (p.length > 1 ? p.filter(y => y !== yr) : p) : [...p, yr]);
                        if (spendFilterMode === "month") setSpendMonths([]);
                      }}
                        style={{ padding: "5px 12px", borderRadius: 12, border: "1px solid", borderColor: sel ? "#e07b54" : "#ddd8d0", background: sel ? "#e07b5422" : "transparent", color: sel ? "#e07b54" : "#9a9088", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                        {yr}
                      </button>
                    );
                  })}
                </div>
              </div>

              {spendFilterMode === "month" && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#9a9088" }}>
                      {"Months" + (spendYears.length > 1 ? " (" + spendYears.join(", ") + ")" : "")}
                    </div>
                    <button onClick={() => {
                      const allKeys = spendYears.flatMap(yr => Array.from({ length: 12 }, (_, i) => yr + "-" + String(i + 1).padStart(2, "0")));
                      setSpendMonths(spendMonths.length === allKeys.length ? [] : allKeys);
                    }} style={{ fontSize: 10, background: "transparent", border: "none", color: "#9a9088", cursor: "pointer", fontFamily: "inherit" }}>
                      {spendMonths.length > 0 ? "Clear all" : "Select all"}
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 5 }}>
                    {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((label, i) => {
                      const monthNum = String(i + 1).padStart(2, "0");
                      const keys = spendYears.map(yr => yr + "-" + monthNum);
                      const selected = keys.some(k => spendMonths.includes(k));
                      return (
                        <button key={label} onClick={() => setSpendMonths(p => selected ? p.filter(m => !keys.includes(m)) : [...p, ...keys.filter(k => !p.includes(k))])}
                          style={{ padding: "6px 0", borderRadius: 6, border: "1px solid", borderColor: selected ? "#e07b54" : "#ddd8d0", background: selected ? "#e07b5422" : "transparent", color: selected ? "#e07b54" : "#9a9088", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#9a9088" }}>Category</div>
                  {spendCats.length > 0 && (
                    <button onClick={() => setSpendCats([])} style={{ fontSize: 10, background: "transparent", border: "none", color: "#9a9088", cursor: "pointer", fontFamily: "inherit" }}>Clear</button>
                  )}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {categories.map(cat => {
                    const sel = spendCats.includes(cat.name);
                    return (
                      <button key={cat.name} onClick={() => setSpendCats(p => p.includes(cat.name) ? p.filter(c => c !== cat.name) : [...p, cat.name])}
                        style={{ padding: "5px 10px", borderRadius: 12, border: "1px solid", borderColor: sel ? cat.color : "#ddd8d0", background: sel ? cat.color + "22" : cat.color + "0f", color: sel ? cat.color : "#9a9088", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                        {cat.icon} {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#9a9088", marginBottom: 6 }}>Status</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["all", "All"], ["unreconciled", "Unreconciled"], ["reconciled", "Reconciled ✓"]].map(([val, label]) => (
                    <button key={val} onClick={() => setSpendReconciled(val)}
                      style={{ flex: 1, padding: "5px 0", borderRadius: 12, border: "1px solid", borderColor: spendReconciled === val ? "#2e9e5e" : "#ddd8d0", background: spendReconciled === val ? "#2e9e5e22" : "transparent", color: spendReconciled === val ? "#2e9e5e" : "#9a9088", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {(() => {
          const filtered = [...data.expenses].filter(e => {
            const yearMatch = spendYears.includes(e.date.slice(0, 4));
            const monthMatch = spendFilterMode === "year" ? true : (spendMonths.length === 0 ? true : spendMonths.includes(getMonthKey(e.date)));
            const catMatch = spendCats.length === 0 ? true : (e.splits && e.splits.length > 0 ? e.splits.some(s => spendCats.includes(s.category)) : spendCats.includes(e.category));
            const reconciled = e.reconciled || false;
            const reconcileMatch = spendReconciled === "all" ? true : spendReconciled === "reconciled" ? reconciled : !reconciled;
            return yearMatch && monthMatch && catMatch && reconcileMatch;
          }).sort((a, b) => new Date(b.date) - new Date(a.date));

          const filteredTotal = filtered.reduce((s, e) => s + e.amount, 0);

          function exportCSV() {
            const headers = ["Date", "Amount", "Category", "Location", "Description", "Account", "Reconciled", "Split"];
            const rows = filtered.flatMap(e => {
              if (e.splits && e.splits.length > 0) {
                return e.splits.map(s => [
                  e.date, s.amount, s.category, e.location || "", e.description || "", e.account || "",
                  e.reconciled ? "Yes" : "No", "Yes",
                ].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(","));
              }
              return [[
                e.date, e.amount, e.category, e.location || "", e.description || "", e.account || "",
                e.reconciled ? "Yes" : "No", "No",
              ].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(",")];
            });
            const csv = [headers.join(","), ...rows].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "spendicorn-export.csv";
            a.click();
            URL.revokeObjectURL(url);
          }

          return (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #ddd8d0" }}>
                <span style={{ fontSize: 12, color: "#9a9088" }}>{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14, color: "#2a2520", fontWeight: "bold" }}>{fmt(filteredTotal)}</span>
                  {filtered.length > 0 && (
                    <button onClick={exportCSV}
                      style={{ fontSize: 11, padding: "4px 10px", borderRadius: 12, border: "1px solid #ddd8d0", background: "transparent", color: "#9a9088", cursor: "pointer", fontFamily: "inherit" }}>
                      Export CSV
                    </button>
                  )}
                </div>
              </div>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", color: "#9a9088", padding: 40, fontSize: 14 }}>Nothing here 👀 Try different filters.</div>
              ) : (
                filtered.map(e => {
                  const isSplit = !!(e.splits && e.splits.length > 0);
                  const cat = getCat(e.category);
                  const segments = isSplit ? e.splits.map(s => ({ color: getCat(s.category).color, pct: (s.amount / e.amount) * 100 })) : null;
                  const isExpanded = expandedFund === ("split_" + e.id);

                  if (isSplit) {
                    return (
                      <div key={e.id} style={{ ...S.card, padding: 0, overflow: "hidden", display: "flex" }}>
                        <div style={{ width: 4, flexShrink: 0, display: "flex", flexDirection: "column" }}>
                          {segments.map((seg, i) => <div key={i} style={{ width: "100%", height: seg.pct + "%", background: seg.color }} />)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ padding: "14px 14px 14px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, " + segments.map(s => s.color + "33").join(", ") + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎯</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.location || e.description || "Split"}</span>
                                <span style={{ fontSize: 10, color: "#7a736a", background: "#f0ede8", padding: "1px 7px", borderRadius: 8, border: "1px solid #ddd8d0", whiteSpace: "nowrap", flexShrink: 0 }}>✂️ {e.splits.length}</span>
                              </div>
                              <button onClick={() => setExpandedFund(isExpanded ? null : ("split_" + e.id))}
                                style={{ fontSize: 10, color: "#9a9088", background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                                <div style={{ display: "flex", gap: 3 }}>{e.splits.map((s, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: getCat(s.category).color }} />)}</div>
                                {isExpanded ? "▲ hide" : "▼ breakdown"}
                              </button>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 14, color: "#2a2520", fontWeight: "bold" }}>{fmt(e.amount)}</div>
                                <div style={{ fontSize: 9, color: "#9a9088", letterSpacing: 0.5 }}>BANK TOTAL</div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <button onClick={() => editExpense(e)} style={{ background: "transparent", border: "1px solid #ddd8d0", color: "#7a736a", padding: "4px 6px", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center" }}><PencilIcon /></button>
                                <button onClick={() => deleteExpense(e.id)} style={{ background: "transparent", border: "1px solid #c9404044", color: "#c94040", padding: "4px 6px", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center" }}><TrashIcon /></button>
                              </div>
                              <button onClick={() => setData(d => ({ ...d, expenses: d.expenses.map(x => x.id === e.id ? { ...x, reconciled: !x.reconciled } : x) }))}
                                style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid", borderColor: e.reconciled ? "#2e9e5e" : "#ddd8d0", background: e.reconciled ? "#2e9e5e" : "transparent", color: e.reconciled ? "#fff" : "#ddd8d0", fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "inherit" }}>✓</button>
                            </div>
                          </div>
                          {isExpanded && (
                            <div style={{ borderTop: "1px dashed #e8e4de", background: "#fafaf8" }}>
                              {e.splits.map((s, i) => {
                                const sc = getCat(s.category);
                                return (
                                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 16px", borderBottom: i < e.splits.length - 1 ? "1px solid #f0ede8" : "none" }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: sc.color, flexShrink: 0 }} />
                                    <span style={{ flex: 1, fontSize: 12, color: sc.color }}>{sc.icon} {s.category}</span>
                                    <span style={{ fontSize: 11, color: "#9a9088" }}>{Math.round((s.amount / e.amount) * 100)}%</span>
                                    <span style={{ fontSize: 12, fontWeight: "bold", color: "#2a2520" }}>{fmt(s.amount)}</span>
                                  </div>
                                );
                              })}
                              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 14px 8px 16px", fontSize: 11, color: "#9a9088", borderTop: "1px solid #f0ede8" }}>
                                <span>Bank total</span>
                                <span style={{ fontWeight: "bold", color: "#2a2520" }}>{fmt(e.amount)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={e.id} style={{ ...S.card, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, borderLeft: "3px solid " + cat.color }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{cat.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.location || e.description || e.category}</div>
                        <div style={{ fontSize: 11, color: "#9a9088", marginTop: 2 }}>
                          {e.description ? e.description + " — " : ""}{e.account} — {new Date(e.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 16, color: cat.color, fontWeight: "bold" }}>{fmt(e.amount)}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 4, justifyContent: "flex-end", alignItems: "center" }}>
                          <button onClick={() => editExpense(e)} style={{ fontSize: 10, background: "transparent", border: "1px solid #ddd8d0", color: "#7a736a", padding: "5px 8px", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center" }}><PencilIcon /></button>
                          <button onClick={() => deleteExpense(e.id)} style={{ fontSize: 10, background: "transparent", border: "1px solid #c9404044", color: "#c94040", padding: "5px 8px", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center" }}><TrashIcon /></button>
                          <button onClick={() => setData(d => ({ ...d, expenses: d.expenses.map(x => x.id === e.id ? { ...x, reconciled: !x.reconciled } : x) }))}
                            style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid", borderColor: e.reconciled ? "#2e9e5e" : "#ddd8d0", background: e.reconciled ? "#2e9e5e" : "transparent", color: e.reconciled ? "#ffffff" : "#ddd8d0", fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "inherit" }}>
                            ✓
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          );
        })()}
      </div>
    )}

    {/* ENVELOPES TAB */}
    {view === "funds" && (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#7a736a" }}>Your Envelopes</div>
          <button onClick={() => { setEditingFund(null); setShowFundModal(true); }}
            style={{ padding: "6px 14px", background: "#e07b5422", border: "1px solid #e07b5455", borderRadius: 20, color: "#e07b54", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
            + New Envelope
          </button>
        </div>

        {data.funds.length === 0 ? (
          <div style={{ ...S.card, textAlign: "center", color: "#9a9088", padding: 28 }}>
            <div style={{ fontSize: 14, marginBottom: 4 }}>No envelopes yet 📬</div>
            <div style={{ fontSize: 12 }}>Set one up and start stashing cash by category.</div>
          </div>
        ) : data.funds.map(fund => {
          const cat = getCat(fund.category);
          const year = new Date().getFullYear();
          const months = computeFundMonths(fund, year);
          const currentMonthData = months.find(m => m.isCurrentMonth);
          const selectedMonthIdx = selectedFundMonth[fund.id] !== undefined ? selectedFundMonth[fund.id] : months.findIndex(m => m.isCurrentMonth);
          const displayMonth = months[selectedMonthIdx] || currentMonthData;
          const isExpanded = expandedFund === fund.id;

          return (
            <div key={fund.id} style={{ ...S.card, padding: 0, overflow: "hidden" }}>
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{fund.icon}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: "bold" }}>{fund.name}</div>
                      <div style={{ fontSize: 11, color: "#9a9088", marginTop: 2 }}>
                        {(Array.isArray(fund.categories) ? fund.categories : [fund.category]).map(cn => getCat(cn).icon).join(" ")} — ${fund.paycheckAllocation}/paycheck — ${(Array.isArray(fund.categories) ? fund.categories : [fund.category]).reduce((s, cn) => s + (data.budgets[cn] || 0), 0)}/mo
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {displayMonth ? (
                      displayMonth.isActive && displayMonth.balance !== null ? (
                        <>
                          <div style={{ fontSize: 20, color: displayMonth.balance < 0 ? "#c94040" : "#2a2520", fontWeight: "bold" }}>{fmt(displayMonth.balance)}</div>
                          <div style={{ fontSize: 11, color: "#9a9088" }}>{displayMonth.balance < 0 ? "deficit" : "remaining"} — {displayMonth.label}</div>
                        </>
                      ) : displayMonth.preFunded !== null && displayMonth.preFunded > 0 ? (
                        <>
                          <div style={{ fontSize: 20, color: cat.color + "cc", fontWeight: "bold" }}>{fmt(displayMonth.preFunded)}</div>
                          <div style={{ fontSize: 11, color: "#9a9088" }}>pre-funded — {displayMonth.label}</div>
                        </>
                      ) : <div style={{ fontSize: 12, color: "#9a9088" }}>{displayMonth.label} — no data</div>
                    ) : <div style={{ fontSize: 12, color: "#9a9088" }}>no data yet</div>}
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#9a9088", marginBottom: 8 }}>{year}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 3 }}>
                    {months.map((m, i) => {
                      const isSelected = i === selectedMonthIdx;
                      const overBudget = m.isActive && m.balance !== null && m.balance < 0;
                      const preFundedPct = m.preFundedPct || 0;
                      const isPreFunded = !m.isActive && preFundedPct > 0;
                      return (
                        <div key={i} onClick={() => setSelectedFundMonth(p => ({ ...p, [fund.id]: i }))}
                          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }}>
                          <div style={{ width: "100%", paddingTop: "100%", position: "relative", borderRadius: 4, border: isSelected ? "2px solid " + cat.color : m.isCurrentMonth ? "2px solid " + cat.color + "88" : "1px solid #ddd8d0", background: isSelected ? cat.color + "18" : "#f5f3ef", overflow: "hidden" }}>
                            {(m.isCurrentMonth || isPreFunded) && (
                              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: (m.isCurrentMonth ? m.fundingPct : preFundedPct) + "%", background: isPreFunded ? cat.color + "33" : cat.color + "44" }} />
                            )}
                            {m.isActive && m.pct > 0 && (
                              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: Math.min(m.pct, 100) + "%", background: overBudget ? "#c94040" : cat.color }} />
                            )}
                          </div>
                          <div style={{ fontSize: 8, color: isSelected ? cat.color : m.isCurrentMonth ? cat.color + "88" : isPreFunded ? cat.color + "99" : "#9a9088", fontWeight: isSelected || m.isCurrentMonth ? "bold" : "normal" }}>
                            {m.label.charAt(0)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                    {[["Funded", cat.color + "44"], ["Surplus", cat.color + "33"], ["Spent", cat.color], ["Over", "#c94040"]].map(([label, bg]) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: bg }} />
                        <span style={{ fontSize: 10, color: "#9a9088" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setExpandedFund(isExpanded ? null : fund.id)}
                    style={{ flex: 1, padding: "8px 0", background: "#f0ede8", border: "1px solid #ddd8d0", borderRadius: 8, color: "#7a736a", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    {isExpanded ? "Hide details" : "Monthly breakdown"}
                  </button>
                  <button onClick={() => { setSurplusTargetFund(fund); setShowSurplusModal(true); }}
                    style={{ padding: "8px 10px", background: "#f4c43022", border: "1px solid #f4c43066", borderRadius: 8, color: "#c49a00", cursor: "pointer", fontFamily: "inherit", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    🏦 Surplus
                  </button>
                  <button onClick={() => { setEditingFund(fund); setShowFundModal(true); }} style={{ padding: "8px 10px", background: "transparent", border: "1px solid #ddd8d0", borderRadius: 8, color: "#7a736a", cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center" }}><PencilIcon /></button>
                  <button onClick={() => deleteFund(fund.id)} style={{ padding: "8px 10px", background: "transparent", border: "1px solid #c9404044", borderRadius: 8, color: "#c94040", cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center" }}><TrashIcon /></button>
                </div>
              </div>

              {isExpanded && (
                <div style={{ borderTop: "1px solid #ddd8d0" }}>
                  {months.filter(m => m.isActive || (m.preFunded !== null && m.preFunded > 0)).map((m, i) => {
                    const fundCats = Array.isArray(fund.categories) ? fund.categories : (fund.category ? [fund.category] : []);
                    const txns = m.isActive ? data.expenses.filter(e => fundCats.includes(e.category) && getMonthKey(e.date) === m.monthKey) : [];
                    return (
                      <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #e8e4de", opacity: m.isActive ? 1 : 0.7 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: m.isCurrentMonth ? "bold" : "normal", color: m.isCurrentMonth ? cat.color : "#2a2520" }}>{m.label}</span>
                            {m.isActive ? (
                              <span style={{ fontSize: 11, color: "#9a9088" }}>{m.paycheckCount} paycheck{m.paycheckCount !== 1 ? "s" : ""}</span>
                            ) : (
                              <span style={{ fontSize: 11, color: cat.color + "99" }}>surplus</span>
                            )}
                          </div>
                          <div style={{ textAlign: "right" }}>
                            {m.isActive ? (
                              <><span style={{ fontSize: 13, color: m.balance < 0 ? "#c94040" : "#2e9e5e", fontWeight: "bold" }}>{fmt(m.balance)}</span><span style={{ fontSize: 11, color: "#9a9088" }}> left</span></>
                            ) : (
                              <><span style={{ fontSize: 13, color: cat.color + "99", fontWeight: "bold" }}>{fmt(m.preFunded)}</span><span style={{ fontSize: 11, color: "#9a9088" }}> pre-funded</span></>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9a9088", marginBottom: 6 }}>
                          <span>Available: {fmt(m.totalAvailable)}</span>
                          {m.isActive && <span>Spent: {fmt(m.spent)}</span>}
                          <span>Cap: {fmt(m.monthlyAlloc)}</span>
                        </div>
                        <div style={{ height: 4, background: "#ddd8d0", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: (m.isActive ? Math.min(m.pct, 100) : m.preFundedPct) + "%", background: m.isActive && m.balance < 0 ? "linear-gradient(90deg, #c94040, #e05555)" : m.isActive ? "linear-gradient(90deg, " + cat.color + ", " + cat.color + "99)" : cat.color + "55", borderRadius: 2 }} />
                        </div>
                        {txns.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            {txns.map(tx => (
                              <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#7a736a", padding: "3px 0" }}>
                                <span>{tx.location || tx.description || tx.category}</span>
                                <span>{fmt(tx.amount)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}

    {/* BUDGETS TAB */}
    {view === "budgets" && (() => {
      const monthlyPay = getScheduledMonthlyIncome();

      const budgetMonthKey = getMonthKey(new Date());
      const budgetMonthExpenses = data.expenses.filter(e => getMonthKey(e.date) === budgetMonthKey);

      // Live total: merge saved budgets with any in-progress edits
      const liveTotalBudgeted = categories.reduce((sum, cat) => {
        const val = budgetForm[cat.name] !== undefined ? (parseFloat(budgetForm[cat.name]) || 0) : (data.budgets[cat.name] || 0);
        return sum + val;
      }, 0);
      const liveOver = monthlyPay !== null && liveTotalBudgeted > monthlyPay;
      const liveRemaining = monthlyPay !== null ? monthlyPay - liveTotalBudgeted : null;
      const livePct = monthlyPay ? Math.min((liveTotalBudgeted / monthlyPay) * 100, 100) : 0;

      return (
      <div>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#7a736a" }}>Your Monthly Plan</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["custom", "Custom"], ["alpha", "A-Z"], ["amount", "$"]].map(([val, label]) => (
              <button key={val} onClick={() => setBudgetSort(val)}
                style={{ padding: "4px 10px", borderRadius: 12, border: "1px solid", borderColor: budgetSort === val ? "#e07b54" : "#ddd8d0", background: budgetSort === val ? "#e07b5422" : "transparent", color: budgetSort === val ? "#e07b54" : "#9a9088", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Live income counter */}
        {monthlyPay !== null && (
          <div style={{ ...S.card, padding: "12px 16px", marginBottom: 12, border: "1px solid " + (liveOver ? "#c9404055" : "#ddd8d0"), background: liveOver ? "#fff5f5" : "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: liveOver ? "#c94040" : "#7a736a" }}>
                {liveOver ? "Over budget ⚠️" : "Budget vs. Income"}
              </span>
              <span style={{ fontSize: 13, fontWeight: "bold", color: liveOver ? "#c94040" : "#2a2520" }}>
                {fmt(liveTotalBudgeted)} / {fmt(monthlyPay)}
              </span>
            </div>
            <div style={{ height: 6, background: "#ddd8d0", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
              <div style={{ height: "100%", width: livePct + "%", borderRadius: 3, background: liveOver ? "linear-gradient(90deg, #c94040, #e05555)" : "linear-gradient(90deg, #2e9e5e, #4abf80)", transition: "width 0.2s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: liveOver ? "#c94040" : "#9a9088" }}>
              {liveOver ? fmt(Math.abs(liveRemaining)) + " over your monthly income" : fmt(liveRemaining) + " still unallocated"}
            </div>
          </div>
        )}

        {/* Category cards */}
        {sortedBudgetCats.map(cat => {
          const budget = data.budgets[cat.name] || 0;
          const spent = budgetMonthExpenses.reduce((s, e) => s + expenseAmountForCat(e, cat.name), 0);
          const unspent = budget - spent;
          const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
          const over = spent > budget;
          return (
            <div key={cat.name} style={{ ...S.card, padding: "14px 16px", borderLeft: "3px solid " + cat.color }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: budget > 0 ? 10 : 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{cat.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: cat.color, marginBottom: 2 }}>{cat.name}</div>
                  {budget > 0 && (
                    <div style={{ fontSize: 11, color: over ? "#c94040" : "#9a9088" }}>
                      {over ? "Over by " + fmt(Math.abs(unspent)) : fmt(unspent) + " unspent"} · {fmt(spent)} of {fmt(budget)}
                    </div>
                  )}
                </div>
                <input type="number"
                  value={budgetForm[cat.name] !== undefined ? budgetForm[cat.name] : budget}
                  onChange={e => setBudgetForm(p => ({ ...p, [cat.name]: e.target.value }))}
                  style={{ width: 100, background: "#f0ede8", border: "1px solid #ddd8d0", color: "#2a2520", padding: "8px 10px", borderRadius: 8, fontSize: 14, fontFamily: "inherit", textAlign: "right" }} />
              </div>
              {budget > 0 && (
                <div style={{ height: 4, background: "#ddd8d0", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: pct + "%", borderRadius: 2, background: over ? "linear-gradient(90deg, #c94040, #e05555)" : "linear-gradient(90deg, " + cat.color + ", " + cat.color + "99)" }} />
                </div>
              )}
            </div>
          );
        })}

        {/* Save button */}
        <button onClick={() => liveOver ? setShowBudgetWarning(true) : saveBudgets()}
          style={{ width: "100%", marginTop: 8, padding: 14, background: liveOver ? "#c94040" : "#e07b54", border: "none", borderRadius: 10, color: "#f5f3ef", fontSize: 14, fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" }}>
          {liveOver ? "Save Budgets ⚠️" : "Save Budgets"}
        </button>

        {/* Over-income warning dialog */}
        {showBudgetWarning && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "#ffffff", borderRadius: 16, padding: 24, maxWidth: 340, width: "100%", border: "1px solid #ddd8d0" }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>⚠️</div>
              <div style={{ fontSize: 15, fontWeight: "bold", color: "#2a2520", marginBottom: 8 }}>You're over your income</div>
              <div style={{ fontSize: 13, color: "#7a736a", marginBottom: 20, lineHeight: 1.5 }}>
                Your budgets total {fmt(liveTotalBudgeted)}, which is {fmt(Math.abs(liveRemaining))} more than your estimated monthly income of {fmt(monthlyPay)}. You can save anyway or go back and adjust.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setShowBudgetWarning(false); saveBudgets(); }}
                  style={{ flex: 1, padding: 12, background: "#c94040", border: "none", borderRadius: 10, color: "#ffffff", fontSize: 13, fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" }}>
                  Save Anyway
                </button>
                <button onClick={() => setShowBudgetWarning(false)}
                  style={{ flex: 1, padding: 12, background: "transparent", border: "1px solid #ddd8d0", borderRadius: 10, color: "#7a736a", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      );
    })()}

    {/* SETTINGS TAB */}
    {view === "settings" && (
      <div>
        {/* Import Data */}
        <div style={{ ...S.card, padding: 0, overflow: "hidden", marginBottom: 12 }}>
          <button onClick={() => setData(d => ({...d, importExpanded: !d.importExpanded}))}
            style={{ width: "100%", padding: "14px 16px", background: "transparent", border: "none", color: "#2a2520", cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#7a736a" }}>Import Data</span>
              <span style={{ fontSize: 11, color: "#9a9088" }}>Load transactions from your Numbers spreadsheet</span>
            </div>
            <ChevronDown style={{ transition: "transform 0.25s ease", transform: data.importExpanded ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }} />
          </button>
          {data.importExpanded && (
            <div style={{ borderTop: "1px solid #ddd8d0", padding: 16 }}>
              <div style={{ fontSize: 13, color: "#7a736a", marginBottom: 12, lineHeight: 1.5 }}>
                This will load <strong>319 transactions</strong> (Jan–Apr 2026) and replace the default categories and accounts with yours. Your current data will be cleared.
              </div>
              <div style={{ fontSize: 11, color: "#9a9088", marginBottom: 16 }}>
                Categories: Beauty & Personal, Boys: Activities, Boys: Clothing & Accessories, Boys: Grooming & Personal, Boys: School, Car Maintenance, Clothing & Accessories, Dining, Entertainment, Gas, Gifts & Occasions, Groceries, Home Decor, Household, Medical, Pet Food, Pet Grooming, Pet Medical, Shopping, Vacation
              </div>
              <button onClick={() => {
                const IMPORT_EXPENSES = [{"id": 1700000000000, "date": "2026-01-01", "amount": 63.29, "category": "Dining", "location": "IPic", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000001, "date": "2026-01-02", "amount": 23.48, "category": "Dining", "location": "Hideaway Pizza", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000002, "date": "2026-01-03", "amount": 49.81, "category": "Groceries", "location": "HEB", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000003, "date": "2026-01-04", "amount": 137.46, "category": "Boys: Activities", "location": "Dick’s", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000004, "date": "2026-01-04", "amount": 25.49, "category": "Boys: Clothing & Accessories", "location": "Amazon", "description": "Order #\n114-6059437-5665824", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000005, "date": "2026-01-04", "amount": 141.75, "category": "Dining", "location": "Topgolf", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000006, "date": "2026-01-04", "amount": 6.77, "category": "Entertainment", "location": "Top Golf", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000007, "date": "2026-01-04", "amount": 30.27, "category": "Shopping", "location": "Amazon", "description": "Order #\n114-5783270-9761820", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000008, "date": "2026-01-05", "amount": 11.34, "category": "Dining", "location": "Taco Bell", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000009, "date": "2026-01-05", "amount": 3.24, "category": "Groceries", "location": "CVS", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000010, "date": "2026-01-05", "amount": 130.94, "category": "Groceries", "location": "HEB", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000011, "date": "2026-01-05", "amount": 150.0, "category": "Medical", "location": "Legacy ER", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000012, "date": "2026-01-05", "amount": 65.67, "category": "Medical", "location": "CVS", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000013, "date": "2026-01-05", "amount": 22.79, "category": "Pet Grooming", "location": "Hollywood Feed", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000014, "date": "2026-01-05", "amount": 32.6, "category": "Shopping", "location": "Amazon", "description": "Order #\n114-5369905-7800253", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000015, "date": "2026-01-05", "amount": 500.0, "category": "Vacation", "location": "Royal Caribbean", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000016, "date": "2026-01-06", "amount": 89.24, "category": "Boys: Activities", "location": "Pickleman’s", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000017, "date": "2026-01-06", "amount": 78.66, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order #\n114-8939955-9859405, #\n114-3085016-8249022", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000018, "date": "2026-01-06", "amount": 10.0, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000019, "date": "2026-01-06", "amount": 13.85, "category": "Medical", "location": "Walgreens", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000020, "date": "2026-01-07", "amount": 86.6, "category": "Boys: Activities", "location": "Buzz Photos", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000021, "date": "2026-01-07", "amount": 1.5, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000022, "date": "2026-01-07", "amount": 66.52, "category": "Groceries", "location": "Kroger", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000023, "date": "2026-01-10", "amount": 61.63, "category": "Dining", "location": "Haywire", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000024, "date": "2026-01-10", "amount": 30.8, "category": "Dining", "location": "Winspear", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000025, "date": "2026-01-10", "amount": 37.31, "category": "Gas", "location": "Shell", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000026, "date": "2026-01-11", "amount": 212.5, "category": "Beauty & Personal", "location": "Senegence", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000027, "date": "2026-01-11", "amount": 110.2, "category": "Beauty & Personal", "location": "Dafni", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000028, "date": "2026-01-11", "amount": 83.74, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order #\n114-8355961-2347404", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000029, "date": "2026-01-11", "amount": 55.0, "category": "Groceries", "location": "Zelle", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000030, "date": "2026-01-12", "amount": 2.54, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000031, "date": "2026-01-12", "amount": 38.06, "category": "Gifts & Occasions", "location": "Walgreens", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000032, "date": "2026-01-12", "amount": 32.68, "category": "Groceries", "location": "Walmart", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000033, "date": "2026-01-12", "amount": 2.92, "category": "Home Decor", "location": "Etsy", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000034, "date": "2026-01-12", "amount": 45.78, "category": "Shopping", "location": "Amazon", "description": "Order #\n114-7311846-6173065", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000035, "date": "2026-01-13", "amount": 15.8, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000036, "date": "2026-01-14", "amount": 10.83, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000037, "date": "2026-01-14", "amount": 27.62, "category": "Gas", "location": "Kroger", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000038, "date": "2026-01-14", "amount": 14.47, "category": "Groceries", "location": "Kroger", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000039, "date": "2026-01-14", "amount": 40.0, "category": "Household", "location": "NTTA", "description": "", "account": "CC CO", "reconciled": false, "splits": null}, {"id": 1700000000040, "date": "2026-01-14", "amount": -30.23, "category": "Household", "location": "Lowes", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000041, "date": "2026-01-14", "amount": 7.58, "category": "Household", "location": "Minute Key", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000042, "date": "2026-01-14", "amount": 1381.48, "category": "Vacation", "location": "Royal Caribbean", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000043, "date": "2026-01-15", "amount": 28.06, "category": "Medical", "location": "Southwest Allergy", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000044, "date": "2026-01-16", "amount": 62.24, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order #\n114-3708826-1171468", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000045, "date": "2026-01-16", "amount": -37.19, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order #\n114-8355961-2347404", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000046, "date": "2026-01-16", "amount": 20.0, "category": "Dining", "location": "Apple Cash", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000047, "date": "2026-01-16", "amount": 12.02, "category": "Dining", "location": "Starbucks", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000048, "date": "2026-01-16", "amount": 7.67, "category": "Dining", "location": "Braums", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000049, "date": "2026-01-16", "amount": 8.98, "category": "Groceries", "location": "HEB", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000050, "date": "2026-01-16", "amount": 109.73, "category": "Groceries", "location": "Kroger", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000051, "date": "2026-01-17", "amount": 61.15, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order #\n114-4817182-1987405", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000052, "date": "2026-01-17", "amount": 9.5, "category": "Dining", "location": "Braums", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000053, "date": "2026-01-17", "amount": 143.68, "category": "Groceries", "location": "HEB", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000054, "date": "2026-01-18", "amount": 148.26, "category": "Clothing & Accessories", "location": "Kendra Scott", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000055, "date": "2026-01-18", "amount": 26.44, "category": "Dining", "location": "Domino’s", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000056, "date": "2026-01-18", "amount": 48.67, "category": "Home Decor", "location": "TJ Maxx", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000057, "date": "2026-01-18", "amount": 42.39, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order #\n114-1606686-5820216", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000058, "date": "2026-01-20", "amount": -31.44, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order #\n114-3708826-1171468", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000059, "date": "2026-01-20", "amount": -23.45, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order #\n114-8355961-2347404", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000060, "date": "2026-01-20", "amount": 15.75, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000061, "date": "2026-01-20", "amount": 50.0, "category": "Entertainment", "location": "Royal Caribbean", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000062, "date": "2026-01-21", "amount": 17.12, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000063, "date": "2026-01-21", "amount": 21.86, "category": "Dining", "location": "Tipsy Crawfish", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000064, "date": "2026-01-21", "amount": 73.57, "category": "Groceries", "location": "Total Wine", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000065, "date": "2026-01-21", "amount": 77.57, "category": "Groceries", "location": "Kroger", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000066, "date": "2026-01-22", "amount": 3.0, "category": "Dining", "location": "Jersey Mike’s", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000067, "date": "2026-01-22", "amount": 21.06, "category": "Gas", "location": "Kroger", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000068, "date": "2026-01-22", "amount": 50.18, "category": "Groceries", "location": "Kroger", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000069, "date": "2026-01-23", "amount": 61.6, "category": "Home Decor", "location": "Amazon", "description": "Order #\n114-3166651-5862614", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000070, "date": "2026-01-24", "amount": 4.24, "category": "Entertainment", "location": "Amazon", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000071, "date": "2026-01-27", "amount": 476.0, "category": "Entertainment", "location": "Broadway Dallas", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000072, "date": "2026-01-27", "amount": 4.24, "category": "Entertainment", "location": "Amazon", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000073, "date": "2026-01-27", "amount": 387.66, "category": "Groceries", "location": "HEB", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000074, "date": "2026-01-29", "amount": 61.07, "category": "Dining", "location": "Cane’s", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000075, "date": "2026-01-30", "amount": 8.65, "category": "Dining", "location": "Braums", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000076, "date": "2026-01-30", "amount": 36.44, "category": "Groceries", "location": "Target", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000077, "date": "2026-01-30", "amount": 83.56, "category": "Groceries", "location": "Kroger", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000078, "date": "2026-01-31", "amount": 111.68, "category": "Dining", "location": "Las Almas Rotas", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000079, "date": "2026-01-31", "amount": 46.8, "category": "Dining", "location": "Music Hall", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000080, "date": "2026-01-31", "amount": 294.0, "category": "Entertainment", "location": "Zelle", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000081, "date": "2026-02-01", "amount": 47.78, "category": "Clothing & Accessories", "location": "Amazon", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000082, "date": "2026-02-02", "amount": 450.0, "category": "Boys: Activities", "location": "Driving School of North Texas", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000083, "date": "2026-02-02", "amount": 8.25, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000084, "date": "2026-02-02", "amount": 34.15, "category": "Dining", "location": "Velvet Taco", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000085, "date": "2026-02-03", "amount": 12.72, "category": "Clothing & Accessories", "location": "Amazon", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000086, "date": "2026-02-03", "amount": 9.6, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000087, "date": "2026-02-03", "amount": 18.94, "category": "Dining", "location": "Chick-fil-A", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000088, "date": "2026-02-03", "amount": 915.0, "category": "Entertainment", "location": "Broadway Dallas", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000089, "date": "2026-02-03", "amount": 31.33, "category": "Gas", "location": "Costco", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000090, "date": "2026-02-03", "amount": 85.58, "category": "Home Decor", "location": "Hobby Lobby", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000091, "date": "2026-02-03", "amount": 40.0, "category": "Household", "location": "NTTA", "description": "", "account": "CC CO", "reconciled": false, "splits": null}, {"id": 1700000000092, "date": "2026-02-04", "amount": 114.14, "category": "Clothing & Accessories", "location": "Surfers Jewelry", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000093, "date": "2026-02-04", "amount": 8.25, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000094, "date": "2026-02-05", "amount": 16.24, "category": "Clothing & Accessories", "location": "American Eagle", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000095, "date": "2026-02-05", "amount": -4.23, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order #: 111-8311020-3619429", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000096, "date": "2026-02-05", "amount": -15.93, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order #: 111-1629944-7149853", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000097, "date": "2026-02-05", "amount": -31.85, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order #: 111-1629944-7149853", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000098, "date": "2026-02-05", "amount": -42.39, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order #: 114-1606686-5820216", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000099, "date": "2026-02-05", "amount": -16.99, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order #: 114-4817182-1987405", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000100, "date": "2026-02-05", "amount": -16.99, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order #: 114-4817182-1987405", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000101, "date": "2026-02-05", "amount": -9.99, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order #\n114-4817182-1987405", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000102, "date": "2026-02-05", "amount": -7.64, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order #: 114-4817182-1987405", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000103, "date": "2026-02-05", "amount": 51.51, "category": "Home Decor", "location": "Amazon", "description": "Order #  111-5596860-5584264", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000104, "date": "2026-02-05", "amount": 74.36, "category": "Home Decor", "location": "Amazon", "description": "Order #  111-4121932-1473846", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000105, "date": "2026-02-05", "amount": -23.34, "category": "Home Decor", "location": "Hobby Lobby", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000106, "date": "2026-02-05", "amount": 36.27, "category": "Home Decor", "location": "Hobby Lobby", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000107, "date": "2026-02-06", "amount": 20.0, "category": "Clothing & Accessories", "location": "Travis Robert’s", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000108, "date": "2026-02-06", "amount": 8.76, "category": "Dining", "location": "Whataburger", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000109, "date": "2026-02-06", "amount": 27.89, "category": "Dining", "location": "Rusty Taco’s", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000110, "date": "2026-02-06", "amount": 87.5, "category": "Dining", "location": "Dan’s Silverleaf", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000111, "date": "2026-02-06", "amount": 25.63, "category": "Groceries", "location": "Trader Joe’s", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000112, "date": "2026-02-06", "amount": 122.63, "category": "Groceries", "location": "Kroger", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000113, "date": "2026-02-06", "amount": 25.21, "category": "Household", "location": "Park Thrive", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000114, "date": "2026-02-06", "amount": 21.93, "category": "Pet Grooming", "location": "Hollywood Feed", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000115, "date": "2026-02-07", "amount": 138.0, "category": "Beauty & Personal", "location": "Claudia", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000116, "date": "2026-02-07", "amount": 48.0, "category": "Boys: Grooming & Personal", "location": "Claudia", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000117, "date": "2026-02-07", "amount": 13.53, "category": "Clothing & Accessories", "location": "Victoria’s Secret", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000118, "date": "2026-02-07", "amount": 40.56, "category": "Dining", "location": "Dave’s Hot Chicken", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000119, "date": "2026-02-07", "amount": 6.26, "category": "Home Decor", "location": "Hobby Lobby", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000120, "date": "2026-02-08", "amount": 19.11, "category": "Home Decor", "location": "Amazon", "description": "Order #\n111-2070282-7301051", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000121, "date": "2026-02-09", "amount": 11.47, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000122, "date": "2026-02-09", "amount": 81.09, "category": "Pet Medical", "location": "Vetsource", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000123, "date": "2026-02-10", "amount": 13.0, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000124, "date": "2026-02-10", "amount": 40.78, "category": "Gas", "location": "Buc-ee’s", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000125, "date": "2026-02-11", "amount": 20.0, "category": "Car Maintenance", "location": "Clean Car Wash", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000126, "date": "2026-02-11", "amount": 189.5, "category": "Clothing & Accessories", "location": "FedEx", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000127, "date": "2026-02-11", "amount": 8.0, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000128, "date": "2026-02-11", "amount": 108.24, "category": "Home Decor", "location": "Home Goods", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000129, "date": "2026-02-11", "amount": -7.77, "category": "Home Decor", "location": "Hobby Lobby", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000130, "date": "2026-02-11", "amount": 8.5, "category": "Shopping", "location": "Amazon", "description": "Order #\n111-4336239-1968229", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000131, "date": "2026-02-11", "amount": 10.27, "category": "Shopping", "location": "Amazon", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000132, "date": "2026-02-12", "amount": 31.85, "category": "Boys: Clothing & Accessories", "location": "Amazon", "description": "Order #\n111-7424337-7569042", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000133, "date": "2026-02-12", "amount": 21.53, "category": "Dining", "location": "88 Bao Bao", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000134, "date": "2026-02-12", "amount": 13.5, "category": "Dining", "location": "Hideaway Pizza", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000135, "date": "2026-02-13", "amount": 7.35, "category": "Dining", "location": "Firehouse Subs", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000136, "date": "2026-02-13", "amount": 147.9, "category": "Dining", "location": "Gloria’s", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000137, "date": "2026-02-13", "amount": 21.83, "category": "Groceries", "location": "Trader Joe’s", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000138, "date": "2026-02-13", "amount": 143.57, "category": "Groceries", "location": "Kroger", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000139, "date": "2026-02-13", "amount": -34.53, "category": "Home Decor", "location": "Amazon", "description": "Order #\n111-5596860-5584264", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000140, "date": "2026-02-13", "amount": -9.55, "category": "Home Decor", "location": "Amazon", "description": "Order #\n111-5596860-5584264", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000141, "date": "2026-02-13", "amount": -7.43, "category": "Home Decor", "location": "Amazon", "description": "Order #\n111-5596860-5584264", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000142, "date": "2026-02-13", "amount": 36.12, "category": "Shopping", "location": "Amazon", "description": "Order #\n111-2302351-7041857", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000143, "date": "2026-02-14", "amount": 4.27, "category": "Dining", "location": "Pit Stop", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000144, "date": "2026-02-14", "amount": 8.74, "category": "Dining", "location": "Portillo’s", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000145, "date": "2026-02-14", "amount": 44.16, "category": "Dining", "location": "88 Bao Bao", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000146, "date": "2026-02-14", "amount": 24.47, "category": "Dining", "location": "Feng Cha", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000147, "date": "2026-02-14", "amount": 60.97, "category": "Dining", "location": "Dominos", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000148, "date": "2026-02-14", "amount": 26.22, "category": "Gas", "location": "Costco", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000149, "date": "2026-02-14", "amount": 32.46, "category": "Home Decor", "location": "Home Goods", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000150, "date": "2026-02-14", "amount": 45.43, "category": "Home Decor", "location": "Michael’s", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000151, "date": "2026-02-16", "amount": 116.88, "category": "Beauty & Personal", "location": "Amazon", "description": "Order #\n111-3024226-2385003", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000152, "date": "2026-02-16", "amount": 2.5, "category": "Car Maintenance", "location": "Air Machine", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000153, "date": "2026-02-16", "amount": 3.98, "category": "Dining", "location": "Donut", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000154, "date": "2026-02-16", "amount": 83.37, "category": "Dining", "location": "The Brunch District", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000155, "date": "2026-02-16", "amount": -21.64, "category": "Home Decor", "location": "Michael’s", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000156, "date": "2026-02-16", "amount": 40.0, "category": "Household", "location": "NTTA", "description": "", "account": "CC CO", "reconciled": false, "splits": null}, {"id": 1700000000157, "date": "2026-02-17", "amount": 8.25, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000158, "date": "2026-02-18", "amount": 13.4, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000159, "date": "2026-02-19", "amount": 12.86, "category": "Dining", "location": "New York Pizza and Pints", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000160, "date": "2026-02-19", "amount": 131.78, "category": "Entertainment", "location": "Zelle", "description": "Concert Toadies", "account": "Bills Checking", "reconciled": false, "splits": null}, {"id": 1700000000161, "date": "2026-02-19", "amount": 88.57, "category": "Groceries", "location": "Target", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000162, "date": "2026-02-19", "amount": 976.8, "category": "Vacation", "location": "Royal Caribbean", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000163, "date": "2026-02-20", "amount": 1.57, "category": "Medical", "location": "CVS", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000164, "date": "2026-02-20", "amount": -523.8, "category": "Vacation", "location": "Royal Caribbean", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000165, "date": "2026-02-20", "amount": -473.8, "category": "Vacation", "location": "Royal Caribbean", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000166, "date": "2026-02-21", "amount": 37.2, "category": "Dining", "location": "Music Hall", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000167, "date": "2026-02-22", "amount": 142.14, "category": "Dining", "location": "Mi Cocina", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000168, "date": "2026-02-22", "amount": 113.95, "category": "Groceries", "location": "HEB", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000169, "date": "2026-02-23", "amount": 69.28, "category": "Car Maintenance", "location": "Discount Tire", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000170, "date": "2026-02-23", "amount": 8.25, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000171, "date": "2026-02-23", "amount": 23.78, "category": "Dining", "location": "Smalls", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000172, "date": "2026-02-23", "amount": 37.27, "category": "Gas", "location": "Costco", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000173, "date": "2026-02-23", "amount": 6.41, "category": "Groceries", "location": "CVS", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000174, "date": "2026-02-23", "amount": 2.08, "category": "Medical", "location": "Walgreens", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000175, "date": "2026-02-23", "amount": 9.3, "category": "Medical", "location": "CVS", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000176, "date": "2026-02-25", "amount": 6.83, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000177, "date": "2026-02-25", "amount": 9.6, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000178, "date": "2026-02-25", "amount": 20.36, "category": "Groceries", "location": "Target", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000179, "date": "2026-02-25", "amount": 40.0, "category": "Household", "location": "NTTA", "description": "", "account": "CC CO", "reconciled": false, "splits": null}, {"id": 1700000000180, "date": "2026-02-27", "amount": 61.2, "category": "Clothing & Accessories", "location": "Dazzle Dry", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000181, "date": "2026-02-27", "amount": 11.9, "category": "Dining", "location": "Burger King", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000182, "date": "2026-02-27", "amount": 13.55, "category": "Gas", "location": "Kroger", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000183, "date": "2026-02-27", "amount": 119.54, "category": "Groceries", "location": "Kroger", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000184, "date": "2026-02-28", "amount": 30.28, "category": "Dining", "location": "Canes", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000185, "date": "2026-02-28", "amount": 69.46, "category": "Dining", "location": "Domino’s", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000186, "date": "2026-03-02", "amount": 8.58, "category": "Medical", "location": "Walgreens", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000187, "date": "2026-03-03", "amount": 3.99, "category": "Dining", "location": "Starbucks", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000188, "date": "2026-03-03", "amount": 8.25, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000189, "date": "2026-03-04", "amount": 23.5, "category": "Boys: School", "location": "McKinney ISD", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000190, "date": "2026-03-04", "amount": 8.9, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000191, "date": "2026-03-05", "amount": 4.7, "category": "Boys: Activities", "location": "Prosper ISD", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000192, "date": "2026-03-05", "amount": 78.59, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order # 111-0376839-8089851", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000193, "date": "2026-03-05", "amount": 33.18, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order # 111-6961340-0637826", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000194, "date": "2026-03-05", "amount": 67.32, "category": "Dining", "location": "Kura", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000195, "date": "2026-03-05", "amount": 24.16, "category": "Dining", "location": "Feng Cha", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000196, "date": "2026-03-05", "amount": 51.26, "category": "Gas", "location": "Buccees", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000197, "date": "2026-03-05", "amount": 63.38, "category": "Shopping", "location": "Amazon", "description": "Order # 111-6190058-7641831", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000198, "date": "2026-03-05", "amount": 416.6, "category": "Medical", "location": "McKinney Pediatric Dentistry", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000199, "date": "2026-03-06", "amount": 47.28, "category": "Dining", "location": "Legacy Hall", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000200, "date": "2026-03-06", "amount": 88.69, "category": "Dining", "location": "Legacy Hall", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000201, "date": "2026-03-06", "amount": 0.0, "category": "Dining", "location": "Burger King", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000202, "date": "2026-03-07", "amount": 91.38, "category": "Boys: Clothing & Accessories", "location": "Amazon", "description": "Order # 111-7936374-4075406", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000203, "date": "2026-03-07", "amount": 29.74, "category": "Boys: Clothing & Accessories", "location": "Amazon", "description": "Order # 111-9219872-5677022", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000204, "date": "2026-03-07", "amount": 20.31, "category": "Boys: Clothing & Accessories", "location": "Pacsun", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000205, "date": "2026-03-07", "amount": 52.83, "category": "Dining", "location": "Piada", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000206, "date": "2026-03-07", "amount": 142.57, "category": "Shopping", "location": "Amazon", "description": "Order # 111-1322552-0269017", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000207, "date": "2026-03-08", "amount": 380.01, "category": "Clothing & Accessories", "location": "Liz Fox Roseberry", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000208, "date": "2026-03-08", "amount": 61.39, "category": "Dining", "location": "Torchy’s Tacos", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000209, "date": "2026-03-08", "amount": 258.68, "category": "Groceries", "location": "Kroger", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000210, "date": "2026-03-09", "amount": 8.97, "category": "Dining", "location": "Whataburger", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000211, "date": "2026-03-09", "amount": 18.81, "category": "Dining", "location": "Whataburger", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000212, "date": "2026-03-09", "amount": 70.36, "category": "Groceries", "location": "Kroger", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000213, "date": "2026-03-09", "amount": 28.06, "category": "Medical", "location": "Southwest Allergy", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000214, "date": "2026-03-10", "amount": 247.58, "category": "Boys: Clothing & Accessories", "location": "Amazon", "description": "Order # 111-7547946-8589007", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000215, "date": "2026-03-10", "amount": 390.65, "category": "Car Maintenance", "location": "McDavid Honda", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000216, "date": "2026-03-10", "amount": 2.75, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000217, "date": "2026-03-10", "amount": 8.79, "category": "Medical", "location": "Legacy ER", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000218, "date": "2026-03-11", "amount": 70.0, "category": "Boys: Activities", "location": "St Gabriel", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000219, "date": "2026-03-11", "amount": -37.18, "category": "Boys: Clothing & Accessories", "location": "Amazon", "description": "Order # 111-1322552-0269017", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000220, "date": "2026-03-11", "amount": -33.79, "category": "Boys: Clothing & Accessories", "location": "Amazon", "description": "Order # 111-1322552-0269017", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000221, "date": "2026-03-11", "amount": -35.05, "category": "Boys: Clothing & Accessories", "location": "Amazon", "description": "Order # 111-1322552-0269017", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000222, "date": "2026-03-11", "amount": 20.75, "category": "Boys: Clothing & Accessories", "location": "Walmart", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000223, "date": "2026-03-11", "amount": -26.55, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order # 111-0376839-8089851", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000224, "date": "2026-03-11", "amount": -18.05, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order # 111-6961340-0637826", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000225, "date": "2026-03-11", "amount": -15.13, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order # 111-6961340-0637826", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000226, "date": "2026-03-11", "amount": 9.95, "category": "Dining", "location": "Chick-fil-A", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000227, "date": "2026-03-11", "amount": 33.09, "category": "Gas", "location": "Buccees", "description": "CRV", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000228, "date": "2026-03-11", "amount": 47.57, "category": "Gas", "location": "Racetrac", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000229, "date": "2026-03-11", "amount": 6.36, "category": "Shopping", "location": "Amazon", "description": "Order # 111-6534096-1045025", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000230, "date": "2026-03-11", "amount": 40.0, "category": "Household", "location": "NTTA", "description": "", "account": "CC CO", "reconciled": false, "splits": null}, {"id": 1700000000231, "date": "2026-03-12", "amount": 4.94, "category": "Boys: Activities", "location": "Hometown Ticketing", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000232, "date": "2026-03-12", "amount": 75.78, "category": "Groceries", "location": "HEB", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000233, "date": "2026-03-12", "amount": 1321.66, "category": "Vacation", "location": "American Airlines", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000234, "date": "2026-03-13", "amount": 5.97, "category": "Boys: Activities", "location": "Hometown Ticketing", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000235, "date": "2026-03-13", "amount": 216.78, "category": "Dining", "location": "Gloria’s", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000236, "date": "2026-03-14", "amount": 57.63, "category": "Dining", "location": "Nova", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000237, "date": "2026-03-14", "amount": 49.0, "category": "Dining", "location": "The Kessler", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000238, "date": "2026-03-16", "amount": 2.45, "category": "Boys: Clothing & Accessories", "location": "UPS", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000239, "date": "2026-03-16", "amount": -82.86, "category": "Boys: Clothing & Accessories", "location": "Amazon", "description": "Order # 111-7547946-8589007", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000240, "date": "2026-03-16", "amount": -67.33, "category": "Car Maintenance", "location": "Amazon", "description": "Order # 111-7936374-4075406", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000241, "date": "2026-03-16", "amount": -23.36, "category": "Car Maintenance", "location": "Amazon", "description": "Order # 111-7547946-8589007", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000242, "date": "2026-03-16", "amount": 20.56, "category": "Dining", "location": "Chick-fil-A", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000243, "date": "2026-03-16", "amount": 47.9, "category": "Dining", "location": "HEB", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000244, "date": "2026-03-16", "amount": 30.0, "category": "Gifts & Occasions", "location": "Best Buy", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000245, "date": "2026-03-16", "amount": 18.94, "category": "Groceries", "location": "HEB", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000246, "date": "2026-03-17", "amount": 62.8, "category": "Dining", "location": "Wren", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000247, "date": "2026-03-17", "amount": 24.6, "category": "Dining", "location": "Watermark", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000248, "date": "2026-03-17", "amount": 26.77, "category": "Household", "location": "Hill Park Cleaners", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000249, "date": "2026-03-18", "amount": 40.0, "category": "Boys: Activities", "location": "Bulldogs Soccer Booster Club", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000250, "date": "2026-03-18", "amount": 87.79, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order # 111-1247982-1388251", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000251, "date": "2026-03-18", "amount": 146.71, "category": "Shopping", "location": "Amazon", "description": "Order # 111-8615031-3603404", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000252, "date": "2026-03-20", "amount": 84.37, "category": "Dining", "location": "Gloria’s", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000253, "date": "2026-03-20", "amount": 20.0, "category": "Entertainment", "location": "Lexus Parking", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000254, "date": "2026-03-21", "amount": 19.34, "category": "Dining", "location": "Braums", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000255, "date": "2026-03-21", "amount": 59.1, "category": "Dining", "location": "Las Almas Rotas", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000256, "date": "2026-03-21", "amount": 33.4, "category": "Dining", "location": "Music Hall", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000257, "date": "2026-03-21", "amount": 225.09, "category": "Groceries", "location": "Kroger", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000258, "date": "2026-03-22", "amount": -45.05, "category": "Boys: Clothing & Accessories", "location": "Amazon", "description": "Order # 111-7547946-8589007", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000259, "date": "2026-03-22", "amount": 63.23, "category": "Gas", "location": "QT", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000260, "date": "2026-03-22", "amount": 36.68, "category": "Household", "location": "Lowes", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000261, "date": "2026-03-23", "amount": -12.96, "category": "Boys: Clothing & Accessories", "location": "Walmart", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000262, "date": "2026-03-23", "amount": 5.27, "category": "Medical", "location": "Walgreens", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000263, "date": "2026-03-24", "amount": -20.31, "category": "Boys: Clothing & Accessories", "location": "Pacsun", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000264, "date": "2026-03-24", "amount": 34.62, "category": "Groceries", "location": "Total Wine", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000265, "date": "2026-03-24", "amount": 50.03, "category": "Groceries", "location": "HEB", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000266, "date": "2026-03-24", "amount": 190.19, "category": "Home Decor", "location": "Amazon", "description": "Order # 111-2046627-8648223", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000267, "date": "2026-03-24", "amount": 89.69, "category": "Home Decor", "location": "Calloways", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000268, "date": "2026-03-24", "amount": -14.33, "category": "Home Decor", "location": "Amazon", "description": "Order # 111-8615031-3603404", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000269, "date": "2026-03-24", "amount": 40.0, "category": "Household", "location": "NTTA", "description": "", "account": "CC CO", "reconciled": false, "splits": null}, {"id": 1700000000270, "date": "2026-03-24", "amount": 19.0, "category": "Medical", "location": "Legacy Smiles", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000271, "date": "2026-03-24", "amount": 81.18, "category": "Pet Food", "location": "PetSmart", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000272, "date": "2026-03-25", "amount": 8.88, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000273, "date": "2026-03-26", "amount": 19.24, "category": "Dining", "location": "iPic", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000274, "date": "2026-03-26", "amount": 68.86, "category": "Entertainment", "location": "iPic", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000275, "date": "2026-03-26", "amount": 190.19, "category": "Home Decor", "location": "Amazon", "description": "Order # 111-9175312-2053826", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000276, "date": "2026-03-27", "amount": 92.21, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order # 111-8527978-7924244", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000277, "date": "2026-03-27", "amount": 126.8, "category": "Dining", "location": "iPic", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000278, "date": "2026-03-27", "amount": 46.65, "category": "Gas", "location": "Kroger", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000279, "date": "2026-03-27", "amount": 150.1, "category": "Groceries", "location": "Target", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000280, "date": "2026-03-27", "amount": 28.12, "category": "Groceries", "location": "HEB", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000281, "date": "2026-03-27", "amount": 74.49, "category": "Groceries", "location": "Kroger", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000282, "date": "2026-03-28", "amount": 25.78, "category": "Boys: Clothing & Accessories", "location": "Uniqlo", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000283, "date": "2026-03-28", "amount": 24.87, "category": "Dining", "location": "Fresca Palapa", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000284, "date": "2026-03-28", "amount": 21.64, "category": "Gifts & Occasions", "location": "Pop Mart", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000285, "date": "2026-03-28", "amount": 106.91, "category": "Gifts & Occasions", "location": "Pacsun", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000286, "date": "2026-03-30", "amount": 8.25, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000287, "date": "2026-03-31", "amount": -35.36, "category": "Boys: Clothing & Accessories", "location": "Amazon", "description": "111-8527978-7924244", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000288, "date": "2026-03-31", "amount": -41.53, "category": "Clothing & Accessories", "location": "Amazon", "description": "111-8527978-7924244", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000289, "date": "2026-03-31", "amount": 9.6, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000290, "date": "2026-03-31", "amount": 673.68, "category": "Vacation", "location": "Cathay Pacific", "description": "", "account": "CC CO", "reconciled": false, "splits": null}, {"id": 1700000000291, "date": "2026-03-31", "amount": 285.3, "category": "Vacation", "location": "Vietnam Airlines", "description": "", "account": "CC CO", "reconciled": false, "splits": null}, {"id": 1700000000292, "date": "2026-03-31", "amount": 85.89, "category": "Vacation", "location": "Amazon", "description": "Order # 111-7396475-0860247", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000293, "date": "2026-03-31", "amount": -190.19, "category": "Home Decor", "location": "Amazon", "description": "111-2046627-8648223", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000294, "date": "2026-04-01", "amount": 7.91, "category": "Dining", "location": "Capital One", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000295, "date": "2026-04-01", "amount": 54.86, "category": "Gifts & Occasions", "location": "Miniso", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000296, "date": "2026-04-02", "amount": 20.5, "category": "Vacation", "location": "Airalo", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000297, "date": "2026-04-02", "amount": 539.4, "category": "Vacation", "location": "Korean Air", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000298, "date": "2026-04-03", "amount": 39.08, "category": "Boys: Clothing & Accessories", "location": "Amazon", "description": "Order # 111-2092194-1576267", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000299, "date": "2026-04-03", "amount": 3.23, "category": "Dining", "location": "Bucees", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000300, "date": "2026-04-03", "amount": 40.73, "category": "Household", "location": "Amazon", "description": "Order # 111-4707686-5421810", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000301, "date": "2026-04-04", "amount": 73.34, "category": "Dining", "location": "HEB", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000302, "date": "2026-04-04", "amount": 104.31, "category": "Groceries", "location": "HEB", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000303, "date": "2026-04-09", "amount": 62.87, "category": "Household", "location": "Target", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000304, "date": "2026-04-06", "amount": 5.89, "category": "Dining", "location": "Chick-fil-A", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000305, "date": "2026-04-06", "amount": 40.0, "category": "Household", "location": "NTTA", "description": "", "account": "CC CO", "reconciled": false, "splits": null}, {"id": 1700000000306, "date": "2026-04-06", "amount": 100.0, "category": "Dining", "location": "Gloria’s", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000307, "date": "2026-04-06", "amount": 25.0, "category": "Boys: School", "location": "SJMS Orchestra Booster Club", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000308, "date": "2026-04-08", "amount": 200.0, "category": "Vacation", "location": "Royal Caribbean", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000309, "date": "2026-04-08", "amount": -18.56, "category": "Clothing & Accessories", "location": "Amazon", "description": "Order # 111-7396475-0860247", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000310, "date": "2026-04-08", "amount": -18.56, "category": "Boys: Clothing & Accessories", "location": "Amazon", "description": "Order # 111-7396475-0860247", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000311, "date": "2026-04-08", "amount": -18.56, "category": "Boys: Clothing & Accessories", "location": "Amazon", "description": "Order # 111-7396475-0860247", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000312, "date": "2026-04-08", "amount": 117.78, "category": "Household", "location": "Target", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000313, "date": "2026-04-08", "amount": 717.86, "category": "Vacation", "location": "Mondrian Hong Kong", "description": "", "account": "CC CO", "reconciled": false, "splits": null}, {"id": 1700000000314, "date": "2026-04-08", "amount": 50.0, "category": "Dining", "location": "Starbucks", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000315, "date": "2026-04-10", "amount": 54.49, "category": "Groceries", "location": "Kroger", "description": "", "account": "CC BoA", "reconciled": false, "splits": null}, {"id": 1700000000316, "date": "2026-04-10", "amount": 13.69, "category": "Dining", "location": "Jersey Mike’s", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000317, "date": "2026-04-10", "amount": 96.58, "category": "Groceries", "location": "Kroger", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}, {"id": 1700000000318, "date": "2026-04-10", "amount": 55.79, "category": "Gas", "location": "Kroger", "description": "", "account": "Primary Checking", "reconciled": false, "splits": null}];
                const IMPORT_CATEGORIES = [{"name": "Beauty & Personal", "icon": "💄", "color": "#e8b84b"}, {"name": "Boys: Activities", "icon": "⚽", "color": "#5b9bd5"}, {"name": "Boys: Clothing & Accessories", "icon": "👕", "color": "#4d96ff"}, {"name": "Boys: Grooming & Personal", "icon": "✂️", "color": "#52b8c4"}, {"name": "Boys: School", "icon": "🎒", "color": "#b07fc7"}, {"name": "Car Maintenance", "icon": "🔧", "color": "#a0a0a0"}, {"name": "Clothing & Accessories", "icon": "👗", "color": "#c77dff"}, {"name": "Dining", "icon": "🍽️", "color": "#e07b54"}, {"name": "Entertainment", "icon": "🎬", "color": "#c94040"}, {"name": "Gas", "icon": "⛽", "color": "#f4845f"}, {"name": "Gifts & Occasions", "icon": "🎁", "color": "#ec4899"}, {"name": "Groceries", "icon": "🛒", "color": "#2e9e5e"}, {"name": "Home Decor", "icon": "🛋️", "color": "#e8b84b"}, {"name": "Household", "icon": "🏠", "color": "#5b9bd5"}, {"name": "Medical", "icon": "💊", "color": "#3d9970"}, {"name": "Pet Food", "icon": "🐾", "color": "#f4845f"}, {"name": "Pet Grooming", "icon": "✂️", "color": "#52b8c4"}, {"name": "Pet Medical", "icon": "🐶", "color": "#2e9e5e"}, {"name": "Shopping", "icon": "🛍️", "color": "#b07fc7"}, {"name": "Vacation", "icon": "✈️", "color": "#6366f1"}];
                const IMPORT_ACCOUNTS = [{"id": 9001, "name": "Primary Checking"}, {"id": 9002, "name": "CC BoA"}, {"id": 9003, "name": "CC CO"}, {"id": 9004, "name": "Bills Checking"}];
                const IMPORT_BUDGETS = {"Beauty & Personal": 0, "Boys: Activities": 0, "Boys: Clothing & Accessories": 0, "Boys: Grooming & Personal": 0, "Boys: School": 0, "Car Maintenance": 0, "Clothing & Accessories": 0, "Dining": 0, "Entertainment": 0, "Gas": 0, "Gifts & Occasions": 0, "Groceries": 0, "Home Decor": 0, "Household": 0, "Medical": 0, "Pet Food": 0, "Pet Grooming": 0, "Pet Medical": 0, "Shopping": 0, "Vacation": 0};
                setData(d => ({
                  ...d,
                  expenses: IMPORT_EXPENSES,
                  categories: IMPORT_CATEGORIES,
                  accounts: IMPORT_ACCOUNTS,
                  defaultAccount: "Primary Checking",
                  budgets: IMPORT_BUDGETS,
                  importExpanded: false,
                }));
                setToast("319 transactions imported! 🎉");
              }}
                style={{ width: "100%", padding: 14, background: "linear-gradient(90deg, #ec4899, #6366f1)", border: "none", borderRadius: 10, color: "#ffffff", fontSize: 14, fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" }}>
                Load My Transactions
              </button>
            </div>
          )}
        </div>
        {/* Pay Schedule */}
        <div style={{ ...S.card, padding: 0, overflow: "hidden", marginBottom: 12 }}>
          <button onClick={() => setPayScheduleExpanded(p => !p)}
            style={{ width: "100%", padding: "14px 16px", background: "transparent", border: "none", color: "#2a2520", cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#7a736a" }}>Your Pay</span>
              <span style={{ fontSize: 11, color: "#9a9088" }}>
                {data.paySchedule && data.paySchedule.firstPayDate
                  ? data.paySchedule.frequency + (data.paySchedule.amount ? " — " + fmt(data.paySchedule.amount) : "") + " — " + data.paychecks.length + " logged"
                  : "Not set"}
              </span>
            </div>
            <ChevronDown style={{ transition: "transform 0.25s ease", transform: payScheduleExpanded ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }} />
          </button>

          {payScheduleExpanded && (
            <div style={{ borderTop: "1px solid #ddd8d0", padding: 16 }}>
              {/* Pay Schedules list */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#7a736a" }}>Pay Schedules</div>
                <button onClick={() => { setEditingPaySchedule(null); setShowPayScheduleModal(true); }}
                  style={{ padding: "5px 12px", background: "#e07b5422", border: "1px solid #e07b5455", borderRadius: 16, color: "#e07b54", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                  + Add Schedule
                </button>
              </div>
              <div style={{ fontSize: 11, color: "#9a9088", marginBottom: 12 }}>Define your regular pay — add a new schedule when your pay changes. Schedules are used for budget planning and YTD estimates.</div>
              {(data.paySchedules || []).length === 0 ? (
                <div style={{ textAlign: "center", color: "#9a9088", padding: "16px 0", fontSize: 13 }}>No schedules yet — tap + Add Schedule to get started.</div>
              ) : (
                [...(data.paySchedules || [])].sort((a, b) => (b.startDate || "0") > (a.startDate || "0") ? 1 : -1).map(s => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderBottom: "1px solid #e8e4de" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: "bold", color: "#2a2520" }}>{fmt(s.amount)} <span style={{ fontWeight: "normal", fontSize: 12, color: "#9a9088" }}>· {s.frequency}</span></div>
                      <div style={{ fontSize: 11, color: "#9a9088", marginTop: 2 }}>
                        {s.startDate ? new Date(s.startDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Start: first paycheck date"}
                        {s.endDate ? " → " + new Date(s.endDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : " → present"}
                      </div>
                    </div>
                    <button onClick={() => { setEditingPaySchedule(s); setShowPayScheduleModal(true); }}
                      style={{ background: "transparent", border: "1px solid #ddd8d0", color: "#7a736a", padding: "5px 8px", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center" }}><PencilIcon /></button>
                    <button onClick={() => deletePaySchedule(s.id)}
                      style={{ background: "transparent", border: "1px solid #c9404044", color: "#c94040", padding: "5px 8px", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center" }}><TrashIcon /></button>
                  </div>
                ))
              )}

              {/* Bonus Pay */}
              <div style={{ paddingTop: 16, borderTop: "1px solid #ddd8d0", marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <button onClick={() => setPaycheckLogExpanded(p => !p)}
                    style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", color: "#2a2520", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
                    <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#7a736a" }}>Bonus Pay</span>
                    <span style={{ fontSize: 11, color: "#9a9088" }}>({data.paychecks.length})</span>
                    <ChevronDown size={12} style={{ transition: "transform 0.25s ease", transform: paycheckLogExpanded ? "rotate(180deg)" : "rotate(0deg)" }} />
                  </button>
                  <button onClick={() => { setEditingPaycheck(null); setShowPaycheckModal(true); }}
                    style={{ padding: "5px 12px", background: "#2e9e5e22", border: "1px solid #2e9e5e55", borderRadius: 16, color: "#2e9e5e", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                    + Add
                  </button>
                </div>

                {paycheckLogExpanded && (
                  <>
                    <div style={{ fontSize: 11, color: "#9a9088", marginBottom: 10 }}>Log bonuses and one-time payments here. You can allocate them to envelopes or let the unallocated portion go to Surplus.</div>
                    {data.paychecks.length === 0 ? (
                      <div style={{ textAlign: "center", color: "#9a9088", padding: "12px 0", fontSize: 13 }}>No bonus pay logged yet.</div>
                    ) : (
                      <>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                          {Array.from(new Set(data.paychecks.map(p => p.date.slice(0, 4)))).sort().reverse().map(yr => (
                            <button key={yr} onClick={() => setPaycheckLogYear(yr)}
                              style={{ padding: "4px 12px", borderRadius: 12, border: "1px solid", borderColor: paycheckLogYear === yr ? "#2e9e5e" : "#ddd8d0", background: paycheckLogYear === yr ? "#2e9e5e22" : "transparent", color: paycheckLogYear === yr ? "#2e9e5e" : "#9a9088", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                              {yr}
                            </button>
                          ))}
                        </div>
                        {(() => {
                          const filtered = [...data.paychecks].filter(p => p.date.startsWith(paycheckLogYear)).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 12);
                          const total = data.paychecks.filter(p => p.date.startsWith(paycheckLogYear)).length;
                          return filtered.length === 0 ? (
                            <div style={{ textAlign: "center", color: "#9a9088", padding: "12px 0", fontSize: 13 }}>Nothing logged for {paycheckLogYear} yet.</div>
                          ) : (
                            <>
                              {filtered.map(p => (
                                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #2a2520" }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, color: "#2a2520" }}>{p.label}</div>
                                    <div style={{ fontSize: 11, color: "#9a9088", marginTop: 2 }}>
                                      {new Date(p.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                      {p.bonusAllocations && p.bonusAllocations.length > 0 && <span style={{ marginLeft: 6, color: "#2e9e5e" }}>· allocated</span>}
                                    </div>
                                  </div>
                                  <div style={{ fontSize: 15, color: "#2e9e5e", fontWeight: "bold" }}>{fmt(p.amount)}</div>
                                  <button onClick={() => { setPendingBonusAlloc(p); setShowBonusAllocModal(true); }}
                                    style={{ fontSize: 10, background: "#2e9e5e22", border: "1px solid #2e9e5e55", color: "#2e9e5e", padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontFamily: "inherit" }}>Allocate</button>
                                  <button onClick={() => { setEditingPaycheck(p); setShowPaycheckModal(true); }}
                                    style={{ background: "transparent", border: "1px solid #ddd8d0", color: "#7a736a", padding: "5px 8px", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center" }}><PencilIcon /></button>
                                  <button onClick={() => deletePaycheck(p.id)}
                                    style={{ background: "transparent", border: "1px solid #c9404044", color: "#c94040", padding: "5px 8px", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center" }}><TrashIcon /></button>
                                </div>
                              ))}
                              {total > 12 && (
                                <div style={{ fontSize: 11, color: "#9a9088", textAlign: "center", paddingTop: 10 }}>Showing 12 of {total} for {paycheckLogYear}</div>
                              )}
                            </>
                          );
                        })()}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Manage Accounts */}
        <div style={{ ...S.card, padding: 0, overflow: "hidden", marginBottom: 12 }}>
          <button onClick={() => setAccountsExpanded(p => !p)}
            style={{ width: "100%", padding: "14px 16px", background: "transparent", border: "none", color: "#2a2520", cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#7a736a" }}>Your Accounts</span>
              <span style={{ fontSize: 11, color: "#9a9088" }}>({accounts.length})</span>
            </div>
            <ChevronDown style={{ transition: "transform 0.25s ease", transform: accountsExpanded ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }} />
          </button>
          {accountsExpanded && (
            <div style={{ borderTop: "1px solid #ddd8d0", padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#9a9088" }}>★ = default</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["custom", "Custom"], ["alpha", "A-Z"]].map(([val, label]) => (
                    <button key={val} onClick={() => setAccountSort(val)}
                      style={{ padding: "3px 10px", borderRadius: 12, border: "1px solid", borderColor: accountSort === val ? "#e07b54" : "#ddd8d0", background: accountSort === val ? "#e07b5422" : "transparent", color: accountSort === val ? "#e07b54" : "#9a9088", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {sortedAccounts.map(acct => (
                <div key={acct.id} draggable={accountSort === "custom"}
                  onDragStart={e => e.dataTransfer.setData("text/plain", String(accounts.findIndex(a => a.id === acct.id)))}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    if (accountSort !== "custom") return;
                    e.preventDefault();
                    const from = parseInt(e.dataTransfer.getData("text/plain"));
                    const to = accounts.findIndex(a => a.id === acct.id);
                    if (from === to) return;
                    setData(d => { const arr = [...d.accounts]; const [moved] = arr.splice(from, 1); arr.splice(to, 0, moved); return { ...d, accounts: arr }; });
                  }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #2a2520", cursor: accountSort === "custom" ? "grab" : "default" }}>
                  {accountSort === "custom" && <span style={{ color: "#9a9088", fontSize: 14, flexShrink: 0 }}><DragIcon /></span>}
                  <span style={{ flex: 1, fontSize: 14, color: acct.name === defaultAccount ? "#e07b54" : "#2a2520" }}>
                    {acct.name}{acct.name === defaultAccount ? " ★" : ""}
                  </span>
                  <button onClick={() => setDefaultAcct(acct.name)}
                    style={{ fontSize: 11, background: "transparent", border: "1px solid", borderColor: acct.name === defaultAccount ? "#e07b54" : "#ddd8d0", borderRadius: 6, color: acct.name === defaultAccount ? "#e07b54" : "#9a9088", cursor: "pointer", padding: "3px 8px", fontFamily: "inherit" }}>
                    {acct.name === defaultAccount ? "Default" : "Set default"}
                  </button>
                  <button onClick={() => { setEditingAcct(acct); setShowAcctModal(true); }}
                    style={{ background: "transparent", border: "1px solid #ddd8d0", color: "#7a736a", padding: "5px 8px", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center" }}><PencilIcon /></button>
                  <button onClick={() => deleteAcct(acct.id, acct.name)}
                    style={{ background: "transparent", border: "1px solid #c9404044", color: "#c94040", padding: "5px 8px", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center" }}><TrashIcon /></button>
                </div>
              ))}
              <button onClick={() => { setEditingAcct(null); setShowAcctModal(true); }}
                style={{ width: "100%", marginTop: 14, padding: "10px 0", background: "#e07b5422", border: "1px dashed #e07b5455", borderRadius: 8, color: "#e07b54", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                + New Account
              </button>
            </div>
          )}
        </div>

        {/* Manage Categories */}
        <div style={{ ...S.card, padding: 0, overflow: "hidden", marginBottom: 12 }}>
          <button onClick={() => setCatsExpanded(p => !p)}
            style={{ width: "100%", padding: "14px 16px", background: "transparent", border: "none", color: "#2a2520", cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Righteous', cursive", color: "#7a736a" }}>Your Categories</span>
              <span style={{ fontSize: 11, color: "#9a9088" }}>({categories.length})</span>
            </div>
            <ChevronDown style={{ transition: "transform 0.25s ease", transform: catsExpanded ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }} />
          </button>
          {catsExpanded && (
            <div style={{ borderTop: "1px solid #ddd8d0", padding: 16 }}>
              <div style={{ fontSize: 11, color: "#9a9088", marginBottom: 12 }}>Drag to reorder, tap ✏️ to edit.</div>
              {categories.map((cat, idx) => (
                <div key={cat.name} draggable
                  onDragStart={e => e.dataTransfer.setData("text/plain", String(idx))}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const from = parseInt(e.dataTransfer.getData("text/plain"));
                    if (from === idx) return;
                    setData(d => { const cats = [...d.categories]; const [moved] = cats.splice(from, 1); cats.splice(idx, 0, moved); return { ...d, categories: cats }; });
                  }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #2a2520", cursor: "grab" }}>
                  <span style={{ color: "#9a9088", fontSize: 14, flexShrink: 0 }}><DragIcon /></span>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{cat.icon}</div>
                  <span style={{ flex: 1, fontSize: 14, color: cat.color }}>{cat.name}</span>
                  <button onClick={() => { setEditingCat(cat); setShowCatModal(true); }}
                    style={{ background: "transparent", border: "1px solid #ddd8d0", color: "#7a736a", padding: "5px 8px", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center" }}><PencilIcon /></button>
                  <button onClick={() => deleteCat(cat.name)}
                    style={{ background: "transparent", border: "1px solid #c9404044", color: "#c94040", padding: "5px 8px", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center" }}><TrashIcon /></button>
                </div>
              ))}
              <button onClick={() => { setEditingCat(null); setShowCatModal(true); }}
                style={{ width: "100%", marginTop: 14, padding: "10px 0", background: "#5b9bd522", border: "1px dashed #5b9bd555", borderRadius: 8, color: "#5b9bd5", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                + New Category
              </button>
            </div>
          )}
        </div>
      </div>
    )}
  </main>

  {/* Nav */}
  <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: "1px solid #ddd8d0", background: "#ffffff", display: "flex", maxWidth: 600, margin: "0 auto" }}>
    {navItems.map(item => {
      const active = view === item.id;
      return (
        <button key={item.id} onClick={() => { setView(item.id); setEditingId(null); }}
          style={{ flex: 1, padding: "10px 0", background: "transparent", border: "none", color: active ? "#ec4899" : "#9a9088", cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
          {active && (
            <div style={{ position: "absolute", inset: "4px 6px", background: "linear-gradient(90deg, #ec4899, #6366f1)", opacity: 0.08, borderRadius: 10 }} />
          )}
          <item.icon size={20} strokeWidth={1.5} />
          <span style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>{item.label}</span>
        </button>
      );
    })}
  </nav>
</div>
);
}
