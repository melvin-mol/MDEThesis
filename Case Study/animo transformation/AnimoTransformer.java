package animo.core.analyser.uppaal.mde;

import java.nio.file.Path;

import animo.core.analyser.uppaal.mde.UppaalMetamodelToUppaalNTA.UppaalMetamodelToUppaalNTATransformer;
import animo.core.analyser.uppaal.mde.animoMetamodelToUppaalMetamodel.AnimoMetamodelToUppaalMetamodelTransformer;
import animo.core.analyser.uppaal.mde.cyNetworkToAnimoMetamodel.CyNetworkToAnimoMetamodelTransformer;
import animo.core.model.Model;

public class AnimoTransformer {
	private CyNetworkToAnimoMetamodelTransformer cyNetworkToAnimoMetamodelTransformer;
	private AnimoMetamodelToUppaalMetamodelTransformer animoMetamodelToUppaalMetamodelTransformer;
	private UppaalMetamodelToUppaalNTATransformer uppaalMetamodelToUppaalNTATransformer;

	public AnimoTransformer() {
		cyNetworkToAnimoMetamodelTransformer = new CyNetworkToAnimoMetamodelTransformer();
		animoMetamodelToUppaalMetamodelTransformer = new AnimoMetamodelToUppaalMetamodelTransformer();
		uppaalMetamodelToUppaalNTATransformer = new UppaalMetamodelToUppaalNTATransformer();
	}

	public String transform(Model model, String modelType) {
		System.out.println("1. CyNetwork -> ANIMO metamodel transformation");
		var animoPath = cyNetworkToAnimoMetamodelTransformer.transform(model);

		System.out.println("2. ANIMO metamodel -> UPPAAL metamodel transformation");
		Path uppaalMetamodelPath = this.animoMetamodelToUppaalMetamodelTransformer
				.transform(animoPath, modelType);

		System.out.println("3. UPPAAL metamodel -> UPPAAL NTA transformation");
		return this.uppaalMetamodelToUppaalNTATransformer.transform(uppaalMetamodelPath);
	}
}
