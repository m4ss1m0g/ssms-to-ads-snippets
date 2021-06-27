const fs = require("fs");
const path = require("path");
const getFiles = require("node-recursive-directory");

// windows user
const user = "john";

// SSMS template folder
const ssmsTemplatesPath = path.normalize(
    `C:/Users/${user}/AppData/Roaming/Microsoft/SQL Server Management Studio/18.0/Templates/Sql`
);
// Azure data studio folder
const outDir = `C:/Users/${user}/AppData/Roaming/azuredatastudio/User/snippets`;

(async() => {
    /**
     * Replace all occurences without regex
     *
     * @param {*} string The string where search
     * @param {*} search The string to replace
     * @param {*} replace The new string
     * @returns The string replaced
     */
    function replaceAll(string, search, replace) {
        return string.split(search).join(replace);
    }

    /**
     * Parse the xml ssms template file
     *
     * @param {*} template The template file to parse
     * @returns The template body with VSCode placeholders
     */
    function parseBody(template) {
        const re = /<.*?>/gm;
        const matches = template.match(re);

        if (matches && matches.length > 0) {
            let idx = 1;

            const distinct = [...new Set(matches)];

            for (const e of distinct) {
                const values = e.replace("<", "").replace(">", "").split(",");
                const value = values
                    .slice(2)
                    .map((e) => e.trim())
                    .join(",");
                template = replaceAll(template, e, `\${${idx++}:${value}}`);
            }

            return template.split("\r\n");
        }

        return template;
    }

    /**
     * Create the json snippet as VSCode compatible fomrat
     *
     * @param {*} prefix The prefix for the snippet
     * @param {*} fileName The SSMS template file name to convert
     * @returns The JSON snippet
     */
    async function createSnippet(prefix, fileName) {
        const name = path.parse(fileName).name;
        const template = await fs.promises.readFile(fileName, {
            encoding: "utf-8"
        });

        const body = parseBody(template);
        prefix = `${prefix}${name.replace(/ /gm, "")}`;
        const description = name;

        const snippet = {
            scope: "sql",
            prefix,
            body,
            description
        };

        return `"${name}":${JSON.stringify(snippet, null, 4)}`;
    }

    /**
     * Main Function
     */
    async function main() {
        const files = await getFiles(ssmsTemplatesPath, true);

        const snippets = [];
        for (const file of files) {
            // console.log(file);
            const dir = file.dirname;
            const snippet = await createSnippet("ssms", file.fullpath);
            snippets.push({ dir, snippet });
        }

        const dirs = [...new Set(snippets.map((p) => p.dir))];

        if (!fs.existsSync(outDir)) {
            await fs.promises.mkdir(outDir, { recursive: true });
        }

        for (const dir of dirs) {
            const dirNew = path.resolve(
                outDir,
                `${dir}.code-snippets`.toLowerCase()
            );
            let s = snippets
                .filter((p) => p.dir === dir)
                .map((p) => p.snippet)
                .join(",");
            s = `{${s}}`;
            await fs.promises.writeFile(dirNew, s);
        }
    }

    // Execute the main function
    try {
        await main();
    } catch (error) {
        throw new Error(error);
    }
})();
