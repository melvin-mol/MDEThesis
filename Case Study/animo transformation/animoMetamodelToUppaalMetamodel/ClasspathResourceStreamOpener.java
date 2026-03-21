package animo.core.analyser.uppaal.mde.animoMetamodelToUppaalMetamodel;

import java.io.IOException;
import java.io.InputStream;

public class ClasspathResourceStreamOpener {
	public boolean resourceExists(String path) {
		try (InputStream ignored = this.openResourceStream(path)) {
			return ignored != null;
		} catch (IOException e) {
			return false;
		}
	}

	public InputStream openResourceStream(String path) throws IOException {
		String normalizedPath = path.replace('\\', '/');
		String absolutePath = normalizedPath.startsWith("/") ? normalizedPath : "/" + normalizedPath;

		ClassLoader classLoader = getClass().getClassLoader();
		if (classLoader != null) {
			try {
				InputStream stream = classLoader.getResourceAsStream(normalizedPath);
				if (stream != null) {
					return stream;
				}
			} catch (RuntimeException ignored) {
				// In some OSGi/Felix states, BundleClassLoader can throw NPE while resolving resources.
			}
		}

		InputStream streamFromClass = getClass().getResourceAsStream(absolutePath);
		if (streamFromClass != null) {
			return streamFromClass;
		}

		ClassLoader contextClassLoader = Thread.currentThread().getContextClassLoader();
		if (contextClassLoader != null) {
			try {
				InputStream contextStream = contextClassLoader.getResourceAsStream(normalizedPath);
				if (contextStream != null) {
					return contextStream;
				}
			} catch (RuntimeException ignored) {
				// Same defensive fallback as above.
			}
		}

		try {
			return ClassLoader.getSystemResourceAsStream(normalizedPath);
		} catch (RuntimeException ignored) {
			return null;
		}
	}
}
