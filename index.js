import { resolve, SEP } from "https://deno.land/std@0.112.0/path/mod.ts";
import { EOL } from "https://deno.land/std@0.112.0/fs/mod.ts";

const DEFAULT_FOLDERS = [
    'development/ActiveTheory',
    'development',
    'websites',
    'apps'
];

async function* generatePaths(search) {
    const paths = await DEFAULT_FOLDERS.reduce(async function reduce(acc, name) {
        acc = await acc;

        let p = resolve(Deno.env.get('HOME'), name);
        try {
            for await (const dir of Deno.readDir(p)) {
                if (dir.name.includes(search) && dir.isDirectory) {
                    acc.push(`${resolve(p, dir.name)}`);
                }
            }
        } catch (error) {
            console.error(error);
        }

        return acc;
    }, []);

    for (let p of paths) {
        yield p;
    }

    yield null;
}

async function* toAlfred(s) {
    var amount = 0;

    for await (const line of s) {
        let chunk = '';

        if (!amount) {
            chunk = `{ "items": [`
        }

        if (line) {
            chunk = `${chunk}{
                "uid": "${line}",
                "type": "file",
                "title": "${line.split(SEP).pop()}",
                "arg": "${line}"
            },`;
        }

        if (!line) {
            chunk = `${chunk}]}${EOL.CRLF}`
        }

        amount++;
        yield chunk;
    }
}

async function main() {
    for await(const data of toAlfred(generatePaths(Deno.args[0]))) {
        await Deno.stdout.write(new TextEncoder().encode(data));
    }

    Deno.stdout.close();
}

main();
