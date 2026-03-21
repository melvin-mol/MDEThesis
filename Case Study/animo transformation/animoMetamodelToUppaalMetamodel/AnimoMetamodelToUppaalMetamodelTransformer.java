package animo.core.analyser.uppaal.mde.animoMetamodelToUppaalMetamodel;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.eclipse.epsilon.emc.emf.EmfModel;
import org.eclipse.epsilon.etl.EtlModule;

import animo.core.analyser.uppaal.mde.Settings;

public class AnimoMetamodelToUppaalMetamodelTransformer {
	public Path transform(Path input, String modelType) {
		String cyNetworkName = "name";
		Path uppaalInstance = Paths.get(System.getProperty("java.io.tmpdir"),
				"UtaEolInstance" + "_" + cyNetworkName + "_" + UUID.randomUUID().toString() + ".model");
		Path tempRoot = null;
		ClasspathResourceAccessor classpathResourceAccessor = new ClasspathResourceAccessor();
		ResourcePathResolver resourcePathResolver = new ResourcePathResolver(classpathResourceAccessor);

		try {
			tempRoot = Files.createTempDirectory("animo-epsilon-");
			tempRoot.toFile().deleteOnExit();
			new File(Files.createFile(uppaalInstance).toString()).deleteOnExit();

			Path animoMetaModelPath = resourcePathResolver.resolvePath(Settings.animoMetaModel, tempRoot);
			Path uppaalMetaModelPath = resourcePathResolver.resolvePath(Settings.uppaalSMCMetaModel, tempRoot);
			Path transformationPath = resourcePathResolver.resolveEtlPath(
					String.format("%s%s/%s", Settings.transformationBase, modelType, "Transformation.etl"), tempRoot);

			// Setup source model
			EmfModel sourceEmfModel = new EmfModel();
			sourceEmfModel.setName("Animo");
			sourceEmfModel.setMetamodelFile(animoMetaModelPath.toString());
			sourceEmfModel.setModelFile(input.toString());
			sourceEmfModel.setReadOnLoad(true);
			sourceEmfModel.load();
			if (!sourceEmfModel.allContents().iterator().hasNext()) {
				throw new IllegalStateException("Source ANIMO model has no contents: " + input);
			}

			// Setup target model
			EmfModel targetEmfModel = new EmfModel();
			targetEmfModel.setName("Uppaal");
			targetEmfModel.setMetamodelFile(uppaalMetaModelPath.toString());
			targetEmfModel.setModelFile(uppaalInstance.toString());
			targetEmfModel.setReadOnLoad(false);
			targetEmfModel.load();

			// Setup ETL transformation
			EtlModule etlModule = new EtlModule();
			etlModule.parse(transformationPath.toFile());
			if (!etlModule.getParseProblems().isEmpty()) {
				throw new IllegalStateException("ETL parse errors: " + etlModule.getParseProblems());
			}
			etlModule.getContext().getModelRepository().addModel(sourceEmfModel);
			etlModule.getContext().getModelRepository().addModel(targetEmfModel);

			// Execute transformation
			etlModule.execute();

			// Store the target model
			targetEmfModel.store();
			if (!targetEmfModel.allContents().iterator().hasNext()) {
				throw new IllegalStateException("Transformation produced an empty UPPAAL model");
			}

			Object targetRoot = targetEmfModel.allContents().iterator().next();
			System.out.println(targetEmfModel.getPropertyGetter().invoke(targetRoot, "name"));
		} catch (Exception e) {
			try {
				Files.deleteIfExists(uppaalInstance);
			} catch (IOException ignored) {
			}
			throw new IllegalStateException("Could not transform ANIMO metamodel to UPPAAL metamodel", e);
		}

		return uppaalInstance;
	}
}
