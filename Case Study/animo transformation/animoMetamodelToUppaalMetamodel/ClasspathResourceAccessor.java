package animo.core.analyser.uppaal.mde.animoMetamodelToUppaalMetamodel;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

public class ClasspathResourceAccessor {
	private final ClasspathResourceStreamOpener classpathResourceStreamOpener;
	private final ClasspathResourceIndex classpathResourceIndex;

	public ClasspathResourceAccessor() {
		this(new ClasspathResourceStreamOpener(), new ClasspathResourceIndex());
	}

	public ClasspathResourceAccessor(ClasspathResourceStreamOpener classpathResourceStreamOpener,
			ClasspathResourceIndex classpathResourceIndex) {
		this.classpathResourceStreamOpener = classpathResourceStreamOpener;
		this.classpathResourceIndex = classpathResourceIndex;
	}

	public void copyToPath(String classpathPath, Path destination) throws IOException {
		String resolvedClasspathPath = resolveResourcePath(classpathPath);
		try (InputStream stream = classpathResourceStreamOpener.openResourceStream(resolvedClasspathPath)) {
			if (stream == null) {
				throw new IOException("Classpath resource not found: " + classpathPath);
			}
			if (destination.getParent() != null) {
				Files.createDirectories(destination.getParent());
			}
			Files.copy(stream, destination, StandardCopyOption.REPLACE_EXISTING);
			destination.toFile().deleteOnExit();
		}
	}

	public String resolveResourcePath(String classpathPath) {
		String normalized = classpathPath.replace('\\', '/');
		if (classpathResourceStreamOpener.resourceExists(normalized)) {
			return normalized;
		}

		String match = classpathResourceIndex.findCaseInsensitiveMatch(normalized);
		if (match != null) {
			return match;
		}

		return normalized;
	}
}
