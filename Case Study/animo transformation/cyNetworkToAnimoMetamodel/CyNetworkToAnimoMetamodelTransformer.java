package animo.core.analyser.uppaal.mde.cyNetworkToAnimoMetamodel;

import java.nio.file.Path;

import animo.core.model.Model;

public class CyNetworkToAnimoMetamodelTransformer {
	public Path transform(Model model) {
		return new AnimoMetamodelFactory().SetDocument().SetNetwork(model).SetNodes(model).SetEdges(model)
				.writeToFile();
	}
}