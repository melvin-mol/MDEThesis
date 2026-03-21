package animo.core.analyser.uppaal.mde.animoMetamodelToUppaalMetamodel;

import java.nio.file.Path;
import java.nio.file.Paths;

public class ResourcePathNormalizer {
	public String normalizeImportPath(String currentClasspathFile, String importPath) {
		Path parent = Paths.get(currentClasspathFile).getParent();
		if (parent == null) {
			parent = Paths.get("");
		}
		return parent.resolve(importPath).normalize().toString().replace('\\', '/');
	}

	public String normalizeResourcePath(String path) {
		String normalized = path.replace('\\', '/');
		if (normalized.startsWith("./")) {
			normalized = normalized.substring(2);
		}
		if (normalized.startsWith("/")) {
			normalized = normalized.substring(1);
		}
		if (normalized.startsWith("src/resources/")) {
			normalized = normalized.substring("src/resources/".length());
		}
		return normalized;
	}
}
