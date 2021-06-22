const fs = require("fs");
const path = require("path");
const getFiles = require("node-recursive-directory");

// Azure data studio folder
// C:\Users\user\AppData\Roaming\azuredatastudio\User\snippets

const user = "user";
const templatePath = path.normalize(
    `C:/Users/${user}/AppData/Roaming/Microsoft/SQL Server Management Studio/18.0/Templates/Sql`
);
const outDir = "C:/temp/snippets";

(async () => {
    function replaceAll(string, search, replace) {
        return string.split(search).join(replace);
    }

    function parseBody(template) {
        const re = new RegExp(/<.*?>/gm);
        let matches = template.match(re);

        if (matches && matches.length > 0) {
            let idx = 1;

            let distinct = [...new Set(matches)];

            for (const e of distinct) {
                const values = e.replace("<", "").replace(">", "").split(",");
                let value = values
                    .slice(2)
                    .map((e) => e.trim())
                    .join(",");
                template = replaceAll(template, e, `\${${idx++}:${value}}`);
            }

            return template.split("\r\n");
        }

        return template;
    }

    async function createSnippet(prefix, fileName) {
        let name = path.parse(fileName).name;
        let template = await fs.promises.readFile(fileName, {
            encoding: "utf-8",
        });

        let body = parseBody(template);
        prefix = `${prefix}${name.replace(/ /gm, "")}`;
        let description = name;

        let snippet = {
            scope: "sql",
            prefix,
            body,
            description,
        };

        return `"${name}":${JSON.stringify(snippet, null, 4)}`;
    }

    // MAIN
    async function main() {
        const files = await getFiles(templatePath, true);

        let snippets = [];
        for (const file of files) {
            // console.log(file);
            const dir = file.dirname;
            const snippet = await createSnippet("ssms", file.fullpath);
            snippets.push({ dir, snippet });
        }

        const dirs = [...new Set(snippets.map((p) => p.dir))];

        for (const dir of dirs) {
            const dirNew = path.resolve(outDir, dir);

            if (!fs.existsSync(dirNew)) {
                await fs.promises.mkdir(dirNew, { recursive: true });
            }
            let s = snippets.filter((p) => p.dir === dir);
            await fs.promises.writeFile(
                path.resolve(dirNew, "snippet.code-snippets"),
                s.map((p) => p.snippet).join(",")
            );
        }
    }

    try {
        await main();
    } catch (error) {
        throw new Error(error);
    }
})();
