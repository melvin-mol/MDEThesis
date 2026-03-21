package animo.core.analyser.uppaal.mde.animoMetamodelToUppaalMetamodel;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ResourceDependencyScanner {
	private static final Pattern ETL_IMPORT_PATTERN = Pattern.compile("^\\s*import\\s+\"([^\"]+)\"\\s*;\\s*$");
	private static final Pattern ECORE_REFERENCE_PATTERN = Pattern.compile("([A-Za-z0-9_./\\\\-]+\\.ecore)#");

	public List<String> findImportedEtlPaths(Path etlFile) throws IOException {
		List<String> imports = new ArrayList<>();
		for (String line : Files.readAllLines(etlFile)) {
			Matcher matcher = ETL_IMPORT_PATTERN.matcher(line);
			if (matcher.matches()) {
				imports.add(matcher.group(1));
			}
		}
		return imports;
	}

	public List<String> findReferencedEcorePaths(Path ecoreFile) throws IOException {
		String content = Files.readString(ecoreFile);
		Matcher matcher = ECORE_REFERENCE_PATTERN.matcher(content);
		List<String> references = new ArrayList<>();
		while (matcher.find()) {
			references.add(matcher.group(1));
		}
		return references;
	}
}
