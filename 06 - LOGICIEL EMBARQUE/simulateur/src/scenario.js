import { writeFileSync } from "node:fs";
import { VentilationController } from "./controller.js";

const controller = new VentilationController();
const rows = ["time_s,co2_ppm,state,fault,output_pct,filtered_ppm"];

for (let t = 0; t <= 7200; t += 5) {
  let co2;
  if (t < 900) co2 = 500;
  else if (t < 2700) co2 = 500 + (t - 900) * (900 / 1800);
  else if (t < 4200) co2 = 1400 + 80 * Math.sin((t - 2700) / 180);
  else co2 = Math.max(520, 1400 - (t - 4200) * (880 / 3000));

  const result = controller.update({ timestampSeconds: t, co2Ppm: co2 });
  rows.push([
    t,
    co2.toFixed(1),
    result.state,
    result.fault,
    result.outputPct,
    result.filteredPpm ?? "",
  ].join(","));
}

const outputPath = new URL("../resultats/scenario_reunion.csv", import.meta.url);
writeFileSync(outputPath, `${rows.join("\n")}\n`, "utf8");
console.log(`Simulation écrite dans ${outputPath.pathname}`);
