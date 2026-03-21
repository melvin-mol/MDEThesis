package animo.core.analyser.uppaal.mde.animoMetamodelToUppaalMetamodel;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.Set;

public class ResourcePathResolver {

	private final ClasspathResourceAccessor classpathResourceAccessor;
	private final ResourceDependencyScanner resourceDependencyScanner;
	private final ResourcePathNormalizer resourcePathNormalizer;

	public ResourcePathResolver(ClasspathResourceAccessor classpathResourceAccessor) {
		this(classpathResourceAccessor, new ResourceDependencyScanner(), new ResourcePathNormalizer());
	}

	public ResourcePathResolver(ClasspathResourceAccessor classpathResourceAccessor,
			ResourceDependencyScanner resourceDependencyScanner,
			ResourcePathNormalizer resourcePathNormalizer) {
		this.classpathResourceAccessor = classpathResourceAccessor;
		this.resourceDependencyScanner = resourceDependencyScanner;
		this.resourcePathNormalizer = resourcePathNormalizer;
	}

	public Path resolvePath(String configuredPath, Path tempRoot) throws IOException {
		Path directPath = Paths.get(configuredPath);
		if (Files.exists(directPath)) {
			return directPath.toAbsolutePath().normalize();
		}

		String classpathPath = resourcePathNormalizer.normalizeResourcePath(configuredPath);
		if (classpathPath.toLowerCase().endsWith(".ecore")) {
			Set<String> visited = new HashSet<>();
			materializeEcoreRecursive(classpathPath, tempRoot, visited);
		} else {
			Path extracted = tempRoot.resolve(classpathPath);
			classpathResourceAccessor.copyToPath(classpathPath, extracted);
		}

		return tempRoot.resolve(classpathPath);
	}

	public Path resolveEtlPath(String configuredPath, Path tempRoot) throws IOException {
		Path directPath = Paths.get(configuredPath);
		if (Files.exists(directPath)) {
			return directPath.toAbsolutePath().normalize();
		}

		String classpathPath = resourcePathNormalizer.normalizeResourcePath(configuredPath);
		Set<String> visited = new HashSet<>();
		materializeEtlRecursive(classpathPath, tempRoot, visited);
		return tempRoot.resolve(classpathPath);
	}

	private void materializeEtlRecursive(String classpathPath, Path tempRoot, Set<String> visited) throws IOException {
		String normalizedClasspathPath = classpathPath.replace('\\', '/');
		if (!visited.add(normalizedClasspathPath)) {
			return;
		}

		Path extracted = tempRoot.resolve(normalizedClasspathPath);
		classpathResourceAccessor.copyToPath(normalizedClasspathPath, extracted);

		for (String imported : resourceDependencyScanner.findImportedEtlPaths(extracted)) {
			String resolved = resourcePathNormalizer.normalizeImportPath(normalizedClasspathPath, imported);
			materializeEtlRecursive(resolved, tempRoot, visited);
		}
	}

	private void materializeEcoreRecursive(String classpathPath, Path tempRoot, Set<String> visited) throws IOException {
		String normalizedClasspathPath = classpathPath.replace('\\', '/');
		if (!visited.add(normalizedClasspathPath)) {
			return;
		}

		Path extracted = tempRoot.resolve(normalizedClasspathPath);
		classpathResourceAccessor.copyToPath(normalizedClasspathPath, extracted);

		for (String referencedEcore : resourceDependencyScanner.findReferencedEcorePaths(extracted)) {
			String resolved = resourcePathNormalizer.normalizeImportPath(normalizedClasspathPath, referencedEcore);
			materializeEcoreRecursive(resolved, tempRoot, visited);
		}
	}
}
