package animo.core.analyser.uppaal.mde.animoMetamodelToUppaalMetamodel;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.stream.Stream;

public class ClasspathResourceIndex {
	private Map<String, String> classpathResourcesByLowercase;

	public String findCaseInsensitiveMatch(String normalizedPath) {
		return this.getClasspathResourcesByLowercase().get(normalizedPath.toLowerCase());
	}

	private Map<String, String> getClasspathResourcesByLowercase() {
		if (classpathResourcesByLowercase != null) {
			return classpathResourcesByLowercase;
		}

		Map<String, String> index = new HashMap<>();
		try {
			URL codeSourceLocation = getClass().getProtectionDomain().getCodeSource().getLocation();
			if (codeSourceLocation == null || !"file".equalsIgnoreCase(codeSourceLocation.getProtocol())) {
				classpathResourcesByLowercase = index;
				return classpathResourcesByLowercase;
			}

			Path location = Paths.get(codeSourceLocation.toURI());
			if (Files.isRegularFile(location) && location.toString().endsWith(".jar")) {
				try (JarFile jarFile = new JarFile(location.toFile())) {
					Enumeration<JarEntry> entries = jarFile.entries();
					while (entries.hasMoreElements()) {
						JarEntry entry = entries.nextElement();
						if (!entry.isDirectory()) {
							String name = entry.getName();
							index.putIfAbsent(name.toLowerCase(), name);
						}
					}
				}
			} else if (Files.isDirectory(location)) {
				try (Stream<Path> fileStream = Files.walk(location)) {
					fileStream.filter(Files::isRegularFile).forEach(path -> {
						String relative = location.relativize(path).toString().replace('\\', '/');
						index.putIfAbsent(relative.toLowerCase(), relative);
					});
				}
			}
		} catch (IOException | URISyntaxException | RuntimeException ignored) {
		}

		classpathResourcesByLowercase = index;
		return classpathResourcesByLowercase;
	}
}
