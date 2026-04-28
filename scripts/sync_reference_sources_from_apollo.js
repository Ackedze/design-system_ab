const fs = require('node:fs');
const path = require('node:path');

const workspaceRoot = path.resolve(__dirname, '../../../..');
const apolloJsonsRoot = path.join(
  workspaceRoot,
  'projects/figma-plugins/Apollo/JSONS',
);
const targetReferencePath = path.join(
  workspaceRoot,
  'shared/assets/design-system_ab/JSONS/referenceSourcesMVP.json',
);

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function walkJsonFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === '.DS_Store') {
      continue;
    }

    const absolutePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsonFiles(absolutePath));
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.json')) {
      continue;
    }

    if (entry.name === 'referenceSourcesMVP.json') {
      continue;
    }

    files.push(absolutePath);
  }

  return files;
}

function inferKind(relativePath) {
  if (relativePath.startsWith('tokens/')) {
    return 'tokens';
  }
  if (relativePath.startsWith('styles/')) {
    return 'styles';
  }
  return 'components';
}

function inferLibraryName(fileNameWithoutExt) {
  const parts = fileNameWithoutExt.split(' -- ');
  return parts[0].trim();
}

function buildGeneratedLibraries(existingReference) {
  const files = walkJsonFiles(apolloJsonsRoot)
    .map((absolutePath) => {
      const relativePath = toPosix(path.relative(apolloJsonsRoot, absolutePath));
      const fileNameWithoutExt = path.basename(relativePath, '.json');
      return {
        relativePath,
        fileNameWithoutExt,
        libraryName: inferLibraryName(fileNameWithoutExt),
        kind: inferKind(relativePath),
        pageName: fileNameWithoutExt,
      };
    })
    .sort((left, right) => left.relativePath.localeCompare(right.relativePath));

  const existingLibraries = Array.isArray(existingReference?.libraries)
    ? existingReference.libraries
    : [];
  const existingLibrariesByName = new Map(
    existingLibraries.map((library) => [String(library?.name || ''), library]),
  );
  const existingEntriesByPath = new Map();

  existingLibraries.forEach((library) => {
    const catalogs = Array.isArray(library?.catalogs) ? library.catalogs : [];
    catalogs.forEach((entry) => {
      const entryPath = String(entry?.path || entry?.fileName || '');
      if (!entryPath) {
        return;
      }
      existingEntriesByPath.set(entryPath, entry);
    });
  });

  const librariesByName = new Map();

  for (const file of files) {
    if (!librariesByName.has(file.libraryName)) {
      const existingLibrary = existingLibrariesByName.get(file.libraryName);
      librariesByName.set(file.libraryName, {
        name: file.libraryName,
        source: {
          figmaLibLink: String(existingLibrary?.source?.figmaLibLink || ''),
          ...Object.fromEntries(
            Object.entries(existingLibrary?.source || {}).filter(
              ([key]) => key !== 'figmaLibLink',
            ),
          ),
        },
        catalogs: [],
        sortKey: file.relativePath,
      });
    }

    const existingEntry = existingEntriesByPath.get(file.relativePath);
    const library = librariesByName.get(file.libraryName);

    library.catalogs.push({
      fileName: file.relativePath,
      path: file.relativePath,
      source: {
        ...(existingEntry?.source || {}),
        kind: file.kind,
        pageName: file.pageName,
      },
    });
  }

  return librariesByName;
}

function mergeLibraries(existingReference, generatedLibrariesByName) {
  const existingLibraries = Array.isArray(existingReference?.libraries)
    ? existingReference.libraries
    : [];
  const merged = [];
  const consumedNames = new Set();

  for (const existingLibrary of existingLibraries) {
    const libraryName = String(existingLibrary?.name || '');
    if (!libraryName) {
      continue;
    }

    const generatedLibrary = generatedLibrariesByName.get(libraryName);
    if (generatedLibrary) {
      merged.push(generatedLibrary);
      consumedNames.add(libraryName);
    }
  }

  const remainingGeneratedLibraries = Array.from(generatedLibrariesByName.values())
    .filter((library) => !consumedNames.has(library.name))
    .sort((left, right) => left.sortKey.localeCompare(right.sortKey));

  merged.push(...remainingGeneratedLibraries);

  return merged.map(({ sortKey, ...library }) => library);
}

function main() {
  const existingReference = readJson(targetReferencePath);
  const generatedLibrariesByName = buildGeneratedLibraries(existingReference);
  const libraries = mergeLibraries(existingReference, generatedLibrariesByName);

  const nextReference = {
    baseUrl:
      String(existingReference?.baseUrl || '').trim() ||
      'https://ackedze.github.io/design-system_ab/JSONS/',
    libraries,
  };

  fs.mkdirSync(path.dirname(targetReferencePath), { recursive: true });
  fs.writeFileSync(
    targetReferencePath,
    JSON.stringify(nextReference, null, 2) + '\n',
  );

  const totalCatalogs = libraries.reduce(
    (sum, library) => sum + (Array.isArray(library.catalogs) ? library.catalogs.length : 0),
    0,
  );

  console.log(
    `Synced ${targetReferencePath} with ${libraries.length} libraries and ${totalCatalogs} catalogs.`,
  );
}

main();
