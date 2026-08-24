import fs from "fs";
import path from "path";
import { publications } from "./src/data/publications";

const jsonPath = path.join(process.cwd(), "src", "data", "publications.json");
fs.writeFileSync(jsonPath, JSON.stringify(publications, null, 2));
console.log("Written to publications.json");
