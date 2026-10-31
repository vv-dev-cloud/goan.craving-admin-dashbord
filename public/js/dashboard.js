const chartValues = { "Today":[22,38,30,55,42,75,63,90], "Yesterday":[30,22,45,35,60,50,70,55], "Last 7 days":[35,48,40,62,55,78,68], "Last 30 days":[25,40,36,60,50,70,85,64,90,72], "This month":[40,55,35,68,50,75,62,90], "Last month":[30,50,45,70,55,65,80,60], "This year":[28,40,35,55,45,65,75,58,80,70,95,85], "Last year":[20,32,45,38,55,48,68,60,75,65,82,72] };
const rangeSelect = document.querySelector("#range");
function renderChart() {
  const period = rangeSelect?.value || "Today";
  const values = chartValues[period] || chartValues.Today;
  document.querySelector("#rangeLabel").textContent = period;
  document.querySelector("#chart").innerHTML = values.map((v,i) => `<div class="bar-wrap"><div class="bar ${i === values.length - 1 ? "current" : ""}" style="height:${v}%"></div></div>`).join("");
  const labels = period.includes("year") || period.includes("Year") ? ["Jan","Mar","May","Jul","Sep","Nov"] : period === "Last 7 days" ? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] : ["1","2","3","4","5","6","7","8"];
  document.querySelector("#chartLabels").innerHTML = labels.map(label => `<span>${label}</span>`).join("");
}
rangeSelect?.addEventListener("change", renderChart);
renderChart();
const toggle = document.querySelector("#createToggle");
const menu = document.querySelector("#createMenu");
toggle?.addEventListener("click", () => menu.classList.toggle("open"));
document.addEventListener("click", e => { if (!e.target.closest(".dropdown-wrap")) menu?.classList.remove("open"); });
document.querySelectorAll("[data-modal]").forEach(button => button.addEventListener("click", () => {
  document.querySelector("#modalTitle").textContent = button.dataset.modal;
  document.querySelector("#modalBackdrop").classList.add("open");
  menu?.classList.remove("open");
}));
document.querySelector("#modalClose")?.addEventListener("click", () => document.querySelector("#modalBackdrop").classList.remove("open"));
document.querySelector("#modalOk")?.addEventListener("click", () => document.querySelector("#modalBackdrop").classList.remove("open"));
document.querySelector("#modalBackdrop")?.addEventListener("click", e => { if (e.target.id === "modalBackdrop") e.currentTarget.classList.remove("open"); });
document.querySelector("#exportCsv")?.addEventListener("click", () => {
  const csv = "Period,Revenue\n" + (rangeSelect.value || "Today") + ",Sample data";
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], {type:"text/csv"}));
  link.download = "goan-craving-report.csv"; link.click(); URL.revokeObjectURL(link.href);
});
