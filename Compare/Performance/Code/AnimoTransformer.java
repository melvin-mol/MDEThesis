package animo.core.analyser.uppaal.mde;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import animo.core.analyser.uppaal.mde.UppaalMetamodelToUppaalNTA.UppaalMetamodelToUppaalNTATransformer;
import animo.core.analyser.uppaal.mde.animoMetamodelToUppaalMetamodel.AnimoMetamodelToUppaalMetamodelTransformer;
import animo.core.analyser.uppaal.mde.cyNetworkToAnimoMetamodel.CyNetworkToAnimoMetamodelTransformer;
import animo.core.model.Model;
import animo.cytoscape.Animo;

public class AnimoTransformer {
	private static final ThreadLocal<TimingContext> CURRENT_TIMING_CONTEXT = new ThreadLocal<>();
	private static final String BENCHMARK_FILE_NAME = "Performance banchmarks thesis implementation.md";
	private static final Path BENCHMARK_FALLBACK_PATH = Path.of(
			"your directory", BENCHMARK_FILE_NAME);

	private static final class TimingContext {
		private final String networkName;
		private final String sectionHeading;
		private final String runHeading;
		private final String benchmarkModelType;
		private final long transformationDuration;

		private TimingContext(String networkName, String sectionHeading, String runHeading, String benchmarkModelType,
				long transformationDuration) {
			this.networkName = networkName;
			this.sectionHeading = sectionHeading;
			this.runHeading = runHeading;
			this.benchmarkModelType = benchmarkModelType;
			this.transformationDuration = transformationDuration;
		}
	}

	private CyNetworkToAnimoMetamodelTransformer cyNetworkToAnimoMetamodelTransformer;
	private AnimoMetamodelToUppaalMetamodelTransformer animoMetamodelToUppaalMetamodelTransformer;
	private UppaalMetamodelToUppaalNTATransformer uppaalMetamodelToUppaalNTATransformer;

	public AnimoTransformer() {
		cyNetworkToAnimoMetamodelTransformer = new CyNetworkToAnimoMetamodelTransformer();
		animoMetamodelToUppaalMetamodelTransformer = new AnimoMetamodelToUppaalMetamodelTransformer();
		uppaalMetamodelToUppaalNTATransformer = new UppaalMetamodelToUppaalNTATransformer();
	}

	public String transform(Model model, String modelType) {
		long transformationStart = System.nanoTime();

		System.out.println("1. CyNetwork -> ANIMO metamodel transformation");
		long step1Start = System.nanoTime();
		var animoPath = cyNetworkToAnimoMetamodelTransformer.transform(model);
		long step1Duration = System.nanoTime() - step1Start;

		System.out.println("2. ANIMO metamodel -> UPPAAL metamodel transformation");
		long step2Start = System.nanoTime();
		Path uppaalMetamodelPath = this.animoMetamodelToUppaalMetamodelTransformer
				.transform(animoPath, modelType);
		long step2Duration = System.nanoTime() - step2Start;

		System.out.println("3. UPPAAL metamodel -> UPPAAL NTA transformation");
		long step3Start = System.nanoTime();
		String uppaalNta = this.uppaalMetamodelToUppaalNTATransformer.transform(uppaalMetamodelPath);
		long step3Duration = System.nanoTime() - step3Start;
		long transformationDuration = System.nanoTime() - transformationStart;

		rememberTimingReport(model, modelType, step1Duration, step2Duration, step3Duration, transformationDuration);
		return uppaalNta;
	}

	public static void appendAnalysisTiming(long analysisDuration) {
		TimingContext timingContext = CURRENT_TIMING_CONTEXT.get();
		if (timingContext == null) {
			return;
		}

		try {
			updateAnalysisTimingInBenchmarkFile(timingContext, analysisDuration);
		} catch (IOException e) {
			System.err.println("Failed to update benchmark timing file: " + e.getMessage());
		} finally {
			CURRENT_TIMING_CONTEXT.remove();
		}
	}

	public static void clearTimingContext() {
		CURRENT_TIMING_CONTEXT.remove();
	}

	private void rememberTimingReport(Model model, String modelType, long step1Duration, long step2Duration,
			long step3Duration, long transformationDuration) {
		String benchmarkModelType = mapBenchmarkModelType(modelType);
		if (benchmarkModelType == null) {
			System.out.println("Timing export skipped for model type: " + modelType);
			CURRENT_TIMING_CONTEXT.remove();
			return;
		}

		String networkName = readNetworkName(model);
		try {
			TimingContext timingContext = reserveBenchmarkSlot(networkName, benchmarkModelType, step1Duration, step2Duration,
					step3Duration, transformationDuration);
			if (timingContext != null) {
				CURRENT_TIMING_CONTEXT.set(timingContext);
			} else {
				CURRENT_TIMING_CONTEXT.remove();
			}
		} catch (IOException e) {
			System.err.println("Failed to reserve benchmark slot: " + e.getMessage());
			CURRENT_TIMING_CONTEXT.remove();
		}
	}

	private static synchronized TimingContext reserveBenchmarkSlot(String networkName, String benchmarkModelType,
			long step1Duration, long step2Duration, long step3Duration, long transformationDuration) throws IOException {
		Path benchmarkFile = findBenchmarkFile();
		if (benchmarkFile == null) {
			System.err.println("Benchmark file not found. Skipping timing export.");
			return null;
		}

		List<String> lines = new ArrayList<>(Arrays.asList(Files.readString(benchmarkFile).split("\\R", -1)));
		for (int sectionStart = 0; sectionStart < lines.size(); sectionStart++) {
			String trimmedLine = lines.get(sectionStart).trim();
			if (!trimmedLine.startsWith("## ")) {
				continue;
			}

			String heading = trimmedLine.substring(3).trim();
			if (!matchesModelHeading(networkName, heading)) {
				continue;
			}

			int sectionEnd = findNextIndex(lines, sectionStart + 1, "## ");
			TimingContext timingContext = fillNextRunTransformation(lines, sectionStart, sectionEnd, heading, networkName,
					benchmarkModelType, step1Duration, step2Duration, step3Duration, transformationDuration);
			if (timingContext != null) {
				Files.writeString(benchmarkFile, String.join(System.lineSeparator(), lines));
				System.out.println("Transformation timing written to: " + benchmarkFile + " for " + heading + " / "
						+ timingContext.runHeading);
				return timingContext;
			}
		}

		System.out.println("No empty benchmark slot found for " + networkName + " (" + benchmarkModelType + ").");
		return null;
	}

	private static synchronized void updateAnalysisTimingInBenchmarkFile(TimingContext timingContext, long analysisDuration)
			throws IOException {
		Path benchmarkFile = findBenchmarkFile();
		if (benchmarkFile == null) {
			System.err.println("Benchmark file not found. Skipping analysis timing export.");
			return;
		}

		String originalContent = Files.readString(benchmarkFile);
		String updatedContent = updateAnalysisTimingContent(originalContent, timingContext, analysisDuration);
		if (!updatedContent.equals(originalContent)) {
			Files.writeString(benchmarkFile, updatedContent);
			System.out.println("Analysis timing written to: " + benchmarkFile + " for " + timingContext.sectionHeading
					+ " / " + timingContext.runHeading);
		} else {
			System.out.println("Reserved benchmark slot could not be updated for " + timingContext.networkName + " ("
					+ timingContext.benchmarkModelType + ").");
		}
	}

	private static Path findBenchmarkFile() {
		if (Files.exists(BENCHMARK_FALLBACK_PATH)) {
			return BENCHMARK_FALLBACK_PATH;
		}

		Path currentPath = Path.of(System.getProperty("user.dir")).toAbsolutePath();
		while (currentPath != null) {
			Path candidate = currentPath.resolve(BENCHMARK_FILE_NAME);
			if (Files.exists(candidate)) {
				return candidate;
			}
			currentPath = currentPath.getParent();
		}
		System.err.println("Benchmark file not found at fallback path or from user.dir="
				+ System.getProperty("user.dir"));
		return null;
	}

	private static TimingContext fillNextRunTransformation(List<String> lines, int sectionStart, int sectionEnd,
			String sectionHeading, String networkName, String benchmarkModelType, long step1Duration, long step2Duration,
			long step3Duration, long transformationDuration) {
		for (int runStart = sectionStart + 1; runStart < sectionEnd; runStart++) {
			String runHeading = lines.get(runStart).trim();
			if (!runHeading.startsWith("### Run ")) {
				continue;
			}
			int runEnd = findNextRunEnd(lines, runStart + 1, sectionEnd);
			TimingContext timingContext = fillTransformationBlock(lines, runStart, runEnd, sectionHeading, runHeading,
					networkName, benchmarkModelType, step1Duration, step2Duration, step3Duration, transformationDuration);
			if (timingContext != null) {
				return timingContext;
			}
		}
		return null;
	}

	private static TimingContext fillTransformationBlock(List<String> lines, int runStart, int runEnd,
			String sectionHeading, String runHeading, String networkName, String benchmarkModelType, long step1Duration,
			long step2Duration, long step3Duration, long transformationDuration) {
		BlockIndices indices = findBlockIndices(lines, runStart, runEnd, benchmarkModelType);
		if (indices == null || hasRecordedValue(lines.get(indices.step1Index))) {
			return null;
		}

		lines.set(indices.transformationIndex, "--- Transformation: " + formatDuration(transformationDuration));
		lines.set(indices.step1Index, "------- Step 1: " + formatDuration(step1Duration));
		lines.set(indices.step2Index, "------- Step 2: " + formatDuration(step2Duration));
		lines.set(indices.step3Index, "------- Step 3: " + formatDuration(step3Duration));

		return new TimingContext(networkName, sectionHeading, runHeading, benchmarkModelType,
				transformationDuration);
	}

	private static String updateAnalysisTimingContent(String content, TimingContext timingContext, long analysisDuration) {
		List<String> lines = new ArrayList<>(Arrays.asList(content.split("\\R", -1)));
		for (int sectionStart = 0; sectionStart < lines.size(); sectionStart++) {
			String trimmedLine = lines.get(sectionStart).trim();
			if (!trimmedLine.startsWith("## ")) {
				continue;
			}
			String heading = trimmedLine.substring(3).trim();
			if (!heading.equals(timingContext.sectionHeading)) {
				continue;
			}

			int sectionEnd = findNextIndex(lines, sectionStart + 1, "## ");
			for (int runStart = sectionStart + 1; runStart < sectionEnd; runStart++) {
				String runHeading = lines.get(runStart).trim();
				if (!runHeading.equals(timingContext.runHeading)) {
					continue;
				}
				int runEnd = findNextRunEnd(lines, runStart + 1, sectionEnd);
				BlockIndices indices = findBlockIndices(lines, runStart, runEnd, timingContext.benchmarkModelType);
				if (indices == null) {
					return content;
				}
				lines.set(indices.analysisIndex,
						"--- Analysis: " + formatDuration(analysisDuration));
				if (indices.totalIndex != -1) {
					lines.set(indices.totalIndex,
							"Total: " + formatDuration(timingContext.transformationDuration + analysisDuration));
				}
				return String.join(System.lineSeparator(), lines);
			}
		}
		return content;
	}

	private static BlockIndices findBlockIndices(List<String> lines, int runStart, int runEnd, String benchmarkModelType) {
		String modelHeader = "- **" + benchmarkModelType + ":**";
		int blockStart = -1;
		for (int i = runStart + 1; i < runEnd; i++) {
			if (lines.get(i).trim().equals(modelHeader)) {
				blockStart = i;
				break;
			}
		}
		if (blockStart == -1) {
			return null;
		}

		int blockEnd = runEnd;
		for (int i = blockStart + 1; i < runEnd; i++) {
			if (lines.get(i).trim().startsWith("- **")) {
				blockEnd = i;
				break;
			}
		}

		int transformationIndex = findLineIndex(lines, "--- Transformation:", blockStart + 1, blockEnd);
		int step1Index = findLineIndex(lines, "------- Step 1:", blockStart + 1, blockEnd);
		int step2Index = findLineIndex(lines, "------- Step 2:", blockStart + 1, blockEnd);
		int step3Index = findLineIndex(lines, "------- Step 3:", blockStart + 1, blockEnd);
		int analysisIndex = findLineIndex(lines, "--- Analysis:", blockStart + 1, blockEnd);
		int totalIndex = findLineIndex(lines, "Total:", blockStart + 1, blockEnd);
		if (transformationIndex == -1 || step1Index == -1 || step2Index == -1 || step3Index == -1
				|| analysisIndex == -1) {
			return null;
		}
		return new BlockIndices(transformationIndex, step1Index, step2Index, step3Index, analysisIndex, totalIndex);
	}

	private static int findNextRunEnd(List<String> lines, int startIndex, int sectionEnd) {
		for (int i = startIndex; i < sectionEnd; i++) {
			String trimmedLine = lines.get(i).trim();
			if (trimmedLine.startsWith("### Run ") || trimmedLine.startsWith("## ")) {
				return i;
			}
		}
		return sectionEnd;
	}

	private static int findNextIndex(List<String> lines, int startIndex, String prefix) {
		for (int i = startIndex; i < lines.size(); i++) {
			if (lines.get(i).trim().startsWith(prefix)) {
				return i;
			}
		}
		return lines.size();
	}

	private static int findLineIndex(List<String> lines, String prefix, int startIndex, int endIndex) {
		for (int i = startIndex; i < endIndex; i++) {
			if (lines.get(i).trim().startsWith(prefix)) {
				return i;
			}
		}
		return -1;
	}

	private static boolean hasRecordedValue(String line) {
		int colonIndex = line.indexOf(':');
		return colonIndex >= 0 && !line.substring(colonIndex + 1).trim().isEmpty();
	}

	private static boolean matchesModelHeading(String networkName, String heading) {
		String normalizedNetworkName = normalizeForMatching(networkName);
		if (normalizedNetworkName.isEmpty()) {
			return false;
		}

		String normalizedHeading = normalizeForMatching(heading);
		String normalizedHeadingSuffix = normalizedHeading;
		int separatorIndex = heading.indexOf(" - ");
		if (separatorIndex >= 0) {
			normalizedHeadingSuffix = normalizeForMatching(heading.substring(separatorIndex + 3));
		}

		return normalizedNetworkName.equals(normalizedHeading)
				|| normalizedNetworkName.equals(normalizedHeadingSuffix)
				|| normalizedHeading.contains(normalizedNetworkName)
				|| normalizedHeadingSuffix.contains(normalizedNetworkName)
				|| normalizedNetworkName.contains(normalizedHeadingSuffix);
	}

	private static String normalizeForMatching(String value) {
		if (value == null) {
			return "";
		}
		return value.toLowerCase().replace(".cys", "").replace('_', ' ').replace('-', ' ')
				.replaceAll("[^a-z0-9 ]", " ").replaceAll("\\s+", " ").trim();
	}

	private static String mapBenchmarkModelType(String modelType) {
		if ("VariablesModelReactantCenteredDeterministic_simplified".equals(modelType)) {
			return "Reactant-centered model simplified";
		}
		if ("VariablesModelReactantCenteredDeterministic".equals(modelType)) {
			return "Reactant-centered model";
		}
		if ("ODE".equals(modelType)) {
			return "Ordinary Differential Equations (ODEs)";
		}
		return null;
	}

	private static String readNetworkName(Model model) {
		String sessionModelName = readCurrentSessionModelName();
		if (sessionModelName != null && !sessionModelName.isBlank()) {
			return sessionModelName;
		}

		if (model == null || model.getProperties() == null
				|| model.getProperties().get(Model.Properties.NETWORK_NAME) == null) {
			return "Unknown model";
		}
		String networkName = model.getProperties().get(Model.Properties.NETWORK_NAME).as(String.class);
		if (networkName == null || networkName.isBlank()) {
			return "Unknown model";
		}
		return networkName;
	}

	private static String readCurrentSessionModelName() {
		try {
			if (Animo.getCytoscapeApp() == null || Animo.getCytoscapeApp().getCySessionManager() == null) {
				return null;
			}
			String currentSessionFileName = Animo.getCytoscapeApp().getCySessionManager().getCurrentSessionFileName();
			if (currentSessionFileName == null || currentSessionFileName.isBlank()) {
				return null;
			}

			File currentSession = new File(currentSessionFileName);
			File parentDirectory = currentSession.getParentFile();
			if (parentDirectory != null && parentDirectory.getName() != null && !parentDirectory.getName().isBlank()) {
				return parentDirectory.getName();
			}

			String fileName = currentSession.getName();
			if (fileName.endsWith(".cys")) {
				fileName = fileName.substring(0, fileName.length() - 4);
			}
			return fileName;
		} catch (Exception e) {
			return null;
		}
	}

	private static String formatDuration(long durationInNanoseconds) {
		double durationInMilliseconds = durationInNanoseconds / 1_000_000.0;
		return String.format("%.3f ms", durationInMilliseconds);
	}

	private static final class BlockIndices {
		private final int transformationIndex;
		private final int step1Index;
		private final int step2Index;
		private final int step3Index;
		private final int analysisIndex;
		private final int totalIndex;

		private BlockIndices(int transformationIndex, int step1Index, int step2Index, int step3Index,
				int analysisIndex, int totalIndex) {
			this.transformationIndex = transformationIndex;
			this.step1Index = step1Index;
			this.step2Index = step2Index;
			this.step3Index = step3Index;
			this.analysisIndex = analysisIndex;
			this.totalIndex = totalIndex;
		}
	}
}
