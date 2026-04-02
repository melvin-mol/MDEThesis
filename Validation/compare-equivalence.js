const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

function bold(text) {
    return `${colors.bold}${text}${colors.reset}`;
}

// Research Method RQ4 traceability:
// This function operationalizes the allowed-difference bullets for comments,
// whitespace, equivalent operator spellings, equivalent increment forms,
// and := versus = when semantically equivalent.
function normalizeExpr(str, isNonSimplified) {
    if (!str) return '';
    let t = str;
    // Decode XML entities so guards, invariants, and label text are compared semantically.
    t = t.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
    // RQ4 bullet: comments are ignored.
    t = t.replace(/\/\*[\s\S]*?\*\//g, ' ');
    t = t.replace(/\/\/.*$/gm, ' ');
    // Normalize whitespace
    t = t.replace(/\s+/g, ' ');
    // Replace logical operators
    t = t.replace(/\band\b/g, '&&');
    t = t.replace(/\bor\b/g, '||');
    t = t.replace(/\bnot\b/g, '!');
    t = t.replace(/!\s+/g, '!');
    t = t.replace(/\s*:=\s*/g, '=');
    t = t.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\s*\+\+\b/g, '$1=$1+1');
    t = t.replace(/\b\+\+\s*([A-Za-z_][A-Za-z0-9_]*)\b/g, '$1=$1+1');
    t = t.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\s*\+=\s*1\b/g, '$1=$1+1');
    t = t.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\1\s*\+\s*1\b/g, '$1=$1+1');
    t = t.replace(/\b([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)+)\s*\+\+/g, '$1=$1+1');
    t = t.replace(/\+\+\s*([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)+)/g, '$1=$1+1');
    t = t.replace(/\b([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)+)\s*\+=\s*1\b/g, '$1=$1+1');
    t = t.replace(/\b([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)+)\s*=\s*\1\s*\+\s*1\b/g, '$1=$1+1');
    
    if (isNonSimplified) {
        t = t.replace(/\bTL\b/g, 'tL');
        t = t.replace(/\bTU\b/g, 'tU');
        t = t.replace(/\bround\s*\(/g, '_ANIMO_round(');
    }
    return t.trim();
}

function removeBalancedOuterParens(text) {
    let t = text.trim();
    while (t.startsWith('(') && t.endsWith(')')) {
        let depth = 0;
        let balancedWrap = true;
        for (let i = 0; i < t.length; i++) {
            const ch = t[i];
            if (ch === '(') depth++;
            if (ch === ')') depth--;
            if (depth === 0 && i < t.length - 1) {
                balancedWrap = false;
                break;
            }
            if (depth < 0) {
                balancedWrap = false;
                break;
            }
        }
        if (!balancedWrap || depth !== 0) break;
        t = t.substring(1, t.length - 1).trim();
    }
    return t;
}

function stripCommentsAndWhitespace(str) {
    if (!str) return '';
    return str
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/\/\/.*$/gm, ' ')
        .replace(/\s+/g, '')
        .trim();
}

function isEffectivelyEmptyDeclaration(str) {
    return stripCommentsAndWhitespace(str) === '';
}

// Research Method RQ4 traceability:
// This function applies the declaration-level normalization rules, including
// the documented non-simplified deterministic exceptions.
function normalizeDeclarationForCompare(str, isNonSimplified) {
    if (!str) return '';
    let t = str;
    t = t.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
    t = t.replace(/\/\*[\s\S]*?\*\//g, ' ');
    t = t.replace(/\/\/.*$/gm, ' ');
    t = t.replace(/\band\b/g, '&&');
    t = t.replace(/\bor\b/g, '||');
    t = t.replace(/\bnot\b/g, '!');
    t = t.replace(/\s*:=\s*/g, '=');
    t = t.replace(/!\s+/g, '!');
    t = t.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\s*\+\+\b/g, '$1=$1+1');
    t = t.replace(/\b\+\+\s*([A-Za-z_][A-Za-z0-9_]*)\b/g, '$1=$1+1');
    t = t.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\s*\+=\s*1\b/g, '$1=$1+1');
    t = t.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\1\s*\+\s*1\b/g, '$1=$1+1');
    t = t.replace(/\b([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)+)\s*\+\+/g, '$1=$1+1');
    t = t.replace(/\+\+\s*([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)+)/g, '$1=$1+1');
    t = t.replace(/\b([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)+)\s*\+=\s*1\b/g, '$1=$1+1');
    t = t.replace(/\b([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)+)\s*=\s*\1\s*\+\s*1\b/g, '$1=$1+1');

    if (isNonSimplified) {
        // RQ4 non-simplified-only allowances:
        // divide(...), int_t, TL/TU versus tL/tU, and round versus _ANIMO_round.
        // The non-simplified deterministic variant may contain an extra divide helper.
        // Ignore the whole declaration unit when it defines divide(...), regardless of nested braces.
        if (/\b(?:int_t|time_t|int|double|double_t|float)\s+divide\s*\(/.test(t)) {
            return '';
        }
        t = t.replace(/\bTL\b/g, 'tL');
        t = t.replace(/\bTU\b/g, 'tU');
        t = t.replace(/\bround\s*\(/g, '_ANIMO_round(');
        t = t.replace(/\btime_t\s+_ANIMO_round\b/g, 'int_t _ANIMO_round');
        // Only documented for non-simplified deterministic variant.
        t = t.replace(/\btypedef\s+int\s+int_t\s*;/g, ' ');
        t = t.replace(/\btypedef\s+int\s*\[[^\]]*\]\s*int_t\s*;/g, ' ');
        t = t.replace(/\b(?:int_t|time_t|int|double|double_t|float)\s+divide\s*\([^)]*\)\s*\{[\s\S]*?\}/g, ' ');
        t = t.replace(/\b(?:int_t|time_t|int|double|double_t|float)\s+divide\s*\([^)]*\)\s*/g, ' ');
    }

    // Ignore braces and normalize whitespace/operator spacing.
    t = t.replace(/[{}]/g, '');
    t = t.replace(/\s+/g, ' ');
    t = t.replace(/\s*([(),;\[\].+\-*/%<>=!&|])\s*/g, '$1');

    // Remove redundant grouping parentheses while preserving function-call argument parentheses.
    // This matches the protocol allowance for parentheses that do not change behavior.
    let prev;
    do {
        prev = t;
        t = t.replace(/(^|[=+\-*/%<>&|!,;:?\s(])\(([^()]+)\)/g, '$1$2');
    } while (t !== prev);

    return t.trim();
}

function normalizeSystemForCompare(str, isNonSimplified) {
    if (!str) return '';
    return normalizeDeclarationForCompare(str, isNonSimplified);
}

// Research Method RQ4 traceability:
// Query formulas are compared strictly except for the documented trailing ': false'
// difference when no explicit simulation goal is present.
function normalizeQueryText(str, isNonSimplified) {
    if (!str) return '';
    let t = normalizeDeclarationForCompare(str, isNonSimplified);
    // Allow the documented query-only difference where generated simulate formulas may end with ': false'.
    t = t.replace(/\s*:\s*false$/, '');
    return t.trim();
}

function declarationUnits(str, isNonSimplified) {
    if (!str) return [];

    const raw = str
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&')
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/\/\/.*$/gm, ' ');

    const units = [];
    let current = '';
    let depth = 0;

    for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        current += ch;

        if (ch === '{') {
            depth++;
        } else if (ch === '}') {
            if (depth > 0) depth--;
            if (depth === 0) {
                units.push(current);
                current = '';
            }
        } else if (ch === ';' && depth === 0) {
            units.push(current);
            current = '';
        }
    }

    if (current.trim()) {
        units.push(current);
    }

    return units
        .map(u => normalizeDeclarationForCompare(u.trim(), isNonSimplified))
        .filter(u => u.length > 0)
        .sort();
}

function parseRateDefinitions(declStr, isNonSimplified) {
    const result = [];
    if (!declStr) return result;

    const txt = declStr.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, ' ');
    const re = /\b(?:double|double_t)\s+([A-Za-z_][A-Za-z0-9_]*_r)\s*(?::=|=)\s*([^;]+);/g;
    let m;
    while ((m = re.exec(txt)) !== null) {
        const name = m[1];
        let raw = removeBalancedOuterParens(normalizeExpr(m[2], isNonSimplified));
        raw = raw.replace(/\s*([(),;+\-*/%<>=!&|])\s*/g, '$1');
        result.push({ name, raw });
    }

    return result;
}

function simpleXmlParse(xmlStr) {
    // Extract main (top-level) declaration block, but skip declaration blocks inside templates
    const result = {
        declaration: '',
        declarationPresent: false,
        system: '',
        systemPresent: false,
        queries: [],
        templates: []
    };
    
    // Find the root nta element
    const ntaMatch = xmlStr.match(/<nta>([\s\S]*)<\/nta>/);
    if (!ntaMatch) return result;
    
    const ntaContent = ntaMatch[1];
    
    // Extract main declaration - it's the first declaration that's a direct child of nta (before any template)
    // Look for declaration that comes before the first template
    const templateStart = ntaContent.indexOf('<template>');
    let searchArea = templateStart > 0 ? ntaContent.substring(0, templateStart) : ntaContent;
    
    const declMatch = searchArea.match(/<declaration>([\s\S]*?)<\/declaration>/);
    if (declMatch) {
        result.declarationPresent = true;
        result.declaration = declMatch[1];
    }

    const systemMatch = ntaContent.match(/<system>([\s\S]*?)<\/system>/);
    if (systemMatch) {
        result.systemPresent = true;
        result.system = systemMatch[1];
    }

    const queryMatches = [...ntaContent.matchAll(/<query>([\s\S]*?)<\/query>/g)];
    for (const qm of queryMatches) {
        const q = qm[1] || '';
        const formulaMatch = q.match(/<formula>([\s\S]*?)<\/formula>/);
        const commentMatch = q.match(/<comment>([\s\S]*?)<\/comment>/);
        result.queries.push({
            formula: formulaMatch ? formulaMatch[1] : '',
            comment: commentMatch ? commentMatch[1] : ''
        });
    }
    
    // Extract all templates
    let pos = 0;
    while (true) {
        const templateStart = ntaContent.indexOf('<template>', pos);
        if (templateStart < 0) break;
        
        const templateEnd = ntaContent.indexOf('</template>', templateStart);
        if (templateEnd < 0) break;
        
        const templateStr = ntaContent.substring(templateStart + 10, templateEnd);
        
        // Extract template name (first name element in template)
        const nameMatch = templateStr.match(/<name[^>]*>([^<]*)<\/name>/);
        const name = nameMatch ? nameMatch[1].trim() : '';
        const parameterMatch = templateStr.match(/<parameter>([\s\S]*?)<\/parameter>/);
        const parameter = parameterMatch ? parameterMatch[1].trim() : '';
        const templateDeclMatch = templateStr.match(/<declaration>([\s\S]*?)<\/declaration>/);
        const templateDeclarationPresent = Boolean(templateDeclMatch);
        const templateDeclaration = templateDeclMatch ? templateDeclMatch[1] : '';
        
        // Extract locations with their IDs
        const locations = {};
        const locationList = [];
        const branchpointList = [];
        const locMatches = [...templateStr.matchAll(/<location\s+id="([^"]*)"[^>]*>([\s\S]*?)<\/location>/g)];
        for (const locMatch of locMatches) {
            const locId = locMatch[1];
            const locBody = locMatch[2] || '';
            const locNameMatch = locBody.match(/<name[^>]*>([^<]*)<\/name>/);
            const locName = locNameMatch ? locNameMatch[1].trim() : locId;
            const invMatch = locBody.match(/<label\s+kind="invariant"[^>]*>([\s\S]*?)<\/label>/);
            const invariant = invMatch ? invMatch[1] : '';
            const committed = /<committed\s*\/>/.test(locBody);
            const urgent = /<urgent\s*\/>/.test(locBody);

            locations[locId] = locName;
            locationList.push({ id: locId, name: locName, invariant, committed, urgent });
        }

        // ETL traceability: Random initialization templates use chance nodes / branchpoints.
        // We compare their presence structurally while ignoring raw generated IDs.
        const branchpointMatches = [...templateStr.matchAll(/<branchpoint\s+id="([^"]*)"[^>]*\/>/g)];
        for (const branchpointMatch of branchpointMatches) {
            const branchpointId = branchpointMatch[1];
            locations[branchpointId] = 'branchpoint';
            branchpointList.push({ id: branchpointId });
        }

        const initMatch = templateStr.match(/<init\s+ref="([^"]*)"\s*\/>/);
        const initRef = initMatch ? initMatch[1] : '';
        
        // Extract transitions
        const transitions = [];
        const transMatches = [...templateStr.matchAll(/<transition>([\s\S]*?)<\/transition>/g)];
        for (const transMatch of transMatches) {
            const transStr = transMatch[1];
            
            const srcMatch = transStr.match(/<source\s+ref="([^"]*)"/);
            const tgtMatch = transStr.match(/<target\s+ref="([^"]*)"/);
            
            const src = srcMatch ? srcMatch[1] : '';
            const srcName = locations[src] || src;
            const tgt = tgtMatch ? tgtMatch[1] : '';
            const tgtName = locations[tgt] || tgt;
            
            const labels = [];
            const labelMatches = [...transStr.matchAll(/<label\s+kind="([^"]*)"[^>]*?(?:\/>|>([\s\S]*?)<\/label>)/g)];
            for (const labelMatch of labelMatches) {
                const kind = labelMatch[1];
                const text = labelMatch[2] || '';
                if (kind && ((kind !== 'select' && kind !== 'assignment') || text.trim())) {
                    labels.push({ kind, text });
                }
            }
            
            transitions.push({ src: srcName, tgt: tgtName, labels });
        }
        
        if (name) {
            result.templates.push({
                name,
                parameter,
                transitions,
                locations: locationList,
                branchpoints: branchpointList,
                initRef,
                declaration: templateDeclaration,
                declarationPresent: templateDeclarationPresent
            });
        }
        
        pos = templateEnd + 11;
    }
    
    return result;
}

function multisetCounts(items) {
    const counts = {};
    for (const item of items) {
        counts[item] = (counts[item] || 0) + 1;
    }
    return counts;
}

function locationSignature(loc, isNonSimplified) {
    // RQ4 bullets: semantic location identity must remain equivalent even if raw IDs differ,
    // and missing <name> is acceptable only when the implied semantic name remains the same.
    const name = (loc.name || '').trim();
    const invariant = removeBalancedOuterParens(normalizeExpr(loc.invariant || '', isNonSimplified));
    return `name=${name}|inv=${invariant}|committed=${loc.committed ? 1 : 0}|urgent=${loc.urgent ? 1 : 0}`;
}

function initSignature(templateObj, isNonSimplified) {
    const byId = {};
    for (const loc of templateObj.locations || []) {
        byId[loc.id] = loc;
    }
    const initLoc = byId[templateObj.initRef || ''];
    if (!initLoc) return `missing-init:${templateObj.initRef || ''}`;
    return locationSignature(initLoc, isNonSimplified);
}

function compareXmlFiles(oldPath, newPath, isNonSimplified) {
    try {
        const oldContent = fs.readFileSync(oldPath, 'utf8');
        const newContent = fs.readFileSync(newPath, 'utf8');
        
        const oldXml = simpleXmlParse(oldContent);
        const newXml = simpleXmlParse(newContent);

        // Allow absent-vs-empty declaration only for the non-simplified deterministic variant.
        if (oldXml.declarationPresent !== newXml.declarationPresent) {
            const allowedAbsence = isNonSimplified
                && isEffectivelyEmptyDeclaration(oldXml.declaration)
                && isEffectivelyEmptyDeclaration(newXml.declaration);
            if (!allowedAbsence) {
                return 'Top-level declaration presence mismatch';
            }
        }

        const oldDeclUnits = declarationUnits(oldXml.declaration, isNonSimplified);
        const newDeclUnits = declarationUnits(newXml.declaration, isNonSimplified);
        const oldDeclCounts = multisetCounts(oldDeclUnits);
        const newDeclCounts = multisetCounts(newDeclUnits);
        const allTopDeclUnits = new Set([...Object.keys(oldDeclCounts), ...Object.keys(newDeclCounts)]);
        for (const unit of allTopDeclUnits) {
            const oc = oldDeclCounts[unit] || 0;
            const nc = newDeclCounts[unit] || 0;
            if (oc !== nc) {
                return 'Top-level declaration content mismatch';
            }
        }

        if (oldDeclUnits.length !== newDeclUnits.length) {
            return 'Top-level declaration content mismatch';
        }

        if (oldXml.systemPresent !== newXml.systemPresent) {
            const allowedAbsence = isEffectivelyEmptyDeclaration(oldXml.system)
                && isEffectivelyEmptyDeclaration(newXml.system);
            if (!allowedAbsence) {
                return 'System block presence mismatch';
            }
        }

        const oldSystemNorm = normalizeSystemForCompare(oldXml.system, isNonSimplified);
        const newSystemNorm = normalizeSystemForCompare(newXml.system, isNonSimplified);
        if (oldSystemNorm !== newSystemNorm) {
            return 'System block content mismatch';
        }

        if (oldXml.queries.length !== newXml.queries.length) {
            return `Query count mismatch: old=${oldXml.queries.length} new=${newXml.queries.length}`;
        }
        for (let i = 0; i < oldXml.queries.length; i++) {
            const oldQ = oldXml.queries[i];
            const newQ = newXml.queries[i];
            const oldFormula = normalizeQueryText(oldQ.formula, isNonSimplified);
            const newFormula = normalizeQueryText(newQ.formula, isNonSimplified);
            if (oldFormula !== newFormula) {
                return `Query formula mismatch at index ${i}`;
            }
            const oldComment = normalizeQueryText(oldQ.comment, isNonSimplified);
            const newComment = normalizeQueryText(newQ.comment, isNonSimplified);
            if (oldComment !== newComment) {
                return `Query comment mismatch at index ${i}`;
            }
        }
        
        // Compare templates
        const oldTemplateNames = oldXml.templates.map(t => t.name).sort();
        const newTemplateNames = newXml.templates.map(t => t.name).sort();
        
        if (oldTemplateNames.join(',') !== newTemplateNames.join(',')) {
            const missing = oldTemplateNames.filter(n => !newTemplateNames.includes(n));
            const extra = newTemplateNames.filter(n => !oldTemplateNames.includes(n));
            if (missing.length > 0) return `Missing templates: ${missing.join(', ')}`;
            if (extra.length > 0) return `Extra templates: ${extra.join(', ')}`;
        }
        
        // Compare transitions
        for (const oldTpl of oldXml.templates) {
            const newTpl = newXml.templates.find(t => t.name === oldTpl.name);
            if (!newTpl) continue;

            const oldParameter = normalizeDeclarationForCompare(oldTpl.parameter || '', isNonSimplified);
            const newParameter = normalizeDeclarationForCompare(newTpl.parameter || '', isNonSimplified);
            if (oldParameter !== newParameter) {
                return `Template parameter mismatch in ${oldTpl.name}`;
            }

            const oldBranchpointCount = (oldTpl.branchpoints || []).length;
            const newBranchpointCount = (newTpl.branchpoints || []).length;
            if (oldBranchpointCount !== newBranchpointCount) {
                return `Branchpoint count mismatch in ${oldTpl.name}`;
            }

            if (oldTpl.declarationPresent !== newTpl.declarationPresent) {
                const allowedAbsence = isNonSimplified
                    && isEffectivelyEmptyDeclaration(oldTpl.declaration)
                    && isEffectivelyEmptyDeclaration(newTpl.declaration);
                if (!allowedAbsence) {
                    return `Template declaration presence mismatch in ${oldTpl.name}`;
                }
            }

            const oldTplDeclUnits = declarationUnits(oldTpl.declaration, isNonSimplified);
            const newTplDeclUnits = declarationUnits(newTpl.declaration, isNonSimplified);
            const oldTplDeclCounts = multisetCounts(oldTplDeclUnits);
            const newTplDeclCounts = multisetCounts(newTplDeclUnits);
            const allTplDeclUnits = new Set([...Object.keys(oldTplDeclCounts), ...Object.keys(newTplDeclCounts)]);
            for (const unit of allTplDeclUnits) {
                const oc = oldTplDeclCounts[unit] || 0;
                const nc = newTplDeclCounts[unit] || 0;
                if (oc !== nc) {
                    return `Template declaration mismatch in ${oldTpl.name}`;
                }
            }

            if (oldTplDeclUnits.length !== newTplDeclUnits.length) {
                return `Template declaration mismatch in ${oldTpl.name}`;
            }

            const oldRates = parseRateDefinitions(oldTpl.declaration, isNonSimplified);
            const newRates = parseRateDefinitions(newTpl.declaration, isNonSimplified);
            const oldRateMap = {};
            const newRateMap = {};

            oldRates.forEach(r => {
                if (!oldRateMap[r.name]) oldRateMap[r.name] = [];
                oldRateMap[r.name].push(r.raw);
            });
            newRates.forEach(r => {
                if (!newRateMap[r.name]) newRateMap[r.name] = [];
                newRateMap[r.name].push(r.raw);
            });

            const allRateNames = new Set([...Object.keys(oldRateMap), ...Object.keys(newRateMap)]);
            for (const rateName of allRateNames) {
                const ov = (oldRateMap[rateName] || []).slice().sort();
                const nv = (newRateMap[rateName] || []).slice().sort();
                if (ov.length !== nv.length) {
                    return `Template rate-definition count mismatch in ${oldTpl.name} for ${rateName}`;
                }
                for (let i = 0; i < ov.length; i++) {
                    if (ov[i] !== nv[i]) {
                        return `Template rate-definition mismatch in ${oldTpl.name} for ${rateName}`;
                    }
                }
            }

            const oldLocSigs = (oldTpl.locations || []).map(loc => locationSignature(loc, isNonSimplified));
            const newLocSigs = (newTpl.locations || []).map(loc => locationSignature(loc, isNonSimplified));
            const oldLocCounts = multisetCounts(oldLocSigs);
            const newLocCounts = multisetCounts(newLocSigs);
            const allLocSigs = new Set([...Object.keys(oldLocCounts), ...Object.keys(newLocCounts)]);
            for (const sig of allLocSigs) {
                const oc = oldLocCounts[sig] || 0;
                const nc = newLocCounts[sig] || 0;
                if (oc !== nc) {
                    return `Location invariant/flag mismatch in ${oldTpl.name}`;
                }
            }

            const oldInitSig = initSignature(oldTpl, isNonSimplified);
            const newInitSig = initSignature(newTpl, isNonSimplified);
            if (oldInitSig !== newInitSig) {
                return `Init-location mismatch in ${oldTpl.name}`;
            }
            
            const oldSigs = getTransitionSignatures(oldTpl.transitions, isNonSimplified);
            const newSigs = getTransitionSignatures(newTpl.transitions, isNonSimplified);
            
            const oldSigCounts = {};
            oldSigs.forEach(s => { oldSigCounts[s] = (oldSigCounts[s] || 0) + 1; });
            
            const newSigCounts = {};
            newSigs.forEach(s => { newSigCounts[s] = (newSigCounts[s] || 0) + 1; });
            
            const allSigs = new Set([...Object.keys(oldSigCounts), ...Object.keys(newSigCounts)]);
            for (const sig of allSigs) {
                const oc = oldSigCounts[sig] || 0;
                const nc = newSigCounts[sig] || 0;
                if (oc !== nc) {
                    return `Transition mismatch in ${oldTpl.name}: old=${oc} new=${nc}`;
                }
            }
        }
        
        return null;
    } catch (err) {
        return `Error comparing files: ${err.message}`;
    }
}

function getTransitionSignatures(transitions, isNonSimplified) {
    return transitions.map(t => {
        // RQ4 bullet: the order of <label> elements inside a transition is not behavior-changing,
        // so labels are normalized and sorted before comparison.
        const labelStrs = t.labels
            .map(l => `${l.kind}=${removeBalancedOuterParens(normalizeExpr(l.text, isNonSimplified))}`)
            .sort();
        return `${t.src}->${t.tgt}||${labelStrs.join('|')}`;
    });
}

function walkCompareDirectory() {
    const EXPECTED_TOTAL_PAIRS = 21;
    const REQUIRED_VARIANTS = [
        'Ordinary Differential Equations (ODEs)',
        'Reactant-centered model',
        'Reactant-centered model simplified'
    ];
    const compareRoot = path.join(process.cwd(), 'Dataset');
    
    if (!fs.existsSync(compareRoot)) {
        log('Error: Dataset directory not found', 'red');
        process.exit(1);
    }
    
    const models = fs.readdirSync(compareRoot)
        .filter(f => fs.statSync(path.join(compareRoot, f)).isDirectory())
        .sort();
    
    let totalPassed = 0;
    let totalFailed = 0;
    let totalChecked = 0;
    const modelResults = [];
    
    log('\nChecking equivalence....', 'cyan');
    
    for (const model of models) {
        const modelPath = path.join(compareRoot, model);
        const variantResults = [];
        let modelFailed = 0;

        for (const variant of REQUIRED_VARIANTS) {
            const variantPath = path.join(modelPath, variant);
            if (!fs.existsSync(variantPath) || !fs.statSync(variantPath).isDirectory()) {
                variantResults.push({ variant, status: 'Failed', error: 'Missing variant directory' });
                modelFailed++;
                totalFailed++;
                continue;
            }

            const oldXmlPath = path.join(variantPath, 'Old.xml');
            const newXmlPath = path.join(variantPath, 'New.xml');
            
            if (!fs.existsSync(oldXmlPath) || !fs.existsSync(newXmlPath)) {
                variantResults.push({ variant, status: 'Failed', error: 'Missing Old.xml or New.xml' });
                modelFailed++;
                totalFailed++;
                continue;
            }

            totalChecked++;
            
            const isNonSimplified = variant === 'Reactant-centered model';
            const error = compareXmlFiles(oldXmlPath, newXmlPath, isNonSimplified);
            
            if (error) {
                variantResults.push({ variant, status: 'Failed', error });
                modelFailed++;
                totalFailed++;
            } else {
                variantResults.push({ variant, status: 'Passed' });
                totalPassed++;
            }
        }
        
        modelResults.push({ model, variantResults, modelFailed });
    }

    if (totalChecked !== EXPECTED_TOTAL_PAIRS) {
        log(`\nError: Expected ${EXPECTED_TOTAL_PAIRS} checked pairs, but checked ${totalChecked}.`, 'red');
        totalFailed++;
    }
    
    // Output results
    for (const { model, variantResults, modelFailed } of modelResults) {
        const modelStatus = modelFailed === 0
            ? `All ${colorize('passed', 'green')}`
            : `${modelFailed} ${colorize('failed', 'red')}`;
        console.log(`- ${bold(model)}: ${modelStatus}`);
        
        for (const { variant, status, error } of variantResults) {
            const statusText = status === 'Passed'
                ? colorize('Passed', 'green')
                : colorize('Failed', 'red');
            const details = error ? ` (${error})` : '';
            console.log(`  --- ${variant}: ${statusText}${details}`);
        }
    }
    
    // Output summary
    console.log(`\nChecked pairs: ${totalChecked}`);
    console.log(`${colorize('Passed', 'green')}: ${totalPassed}`);
    console.log(`${colorize('Failed', 'red')}: ${totalFailed}`);
    
    process.exit(totalFailed === 0 ? 0 : 1);
}

walkCompareDirectory();
