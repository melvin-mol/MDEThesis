package animo.core.analyser.uppaal.mde.cyNetworkToAnimoMetamodel;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import animo.core.AnimoBackend;
import animo.core.model.Model;
import animo.core.model.Reactant;
import animo.core.model.Reaction;
import animo.core.model.Scenario3;
import animo.util.XmlConfiguration;

public class AnimoMetamodelFactory {
	private Document document;
	private Element element;
	private final FactoryHelper factoryHelper = new FactoryHelper();

	private static final String DEFAULT_OUTPUT_FILE_NAME = "animoMetamodelFilled.model";

	public AnimoMetamodelFactory SetDocument() {
		Document localDocument;
		try {
			localDocument = DocumentBuilderFactory.newInstance().newDocumentBuilder().newDocument();
		} catch (ParserConfigurationException e) {
			throw new IllegalStateException("Could not instantiate a new ANIMO metamodel document", e);
		}
		document = localDocument;
		element = document.createElement("ANIMO:Network");
		document.appendChild(element);
		return this;
	}

	public AnimoMetamodelFactory SetNetwork(Model model) {
		String uncertainty = factoryHelper.readModelValue(model, Model.Properties.UNCERTAINTY, null);
		if (uncertainty == null || uncertainty.trim().isEmpty()) {
			uncertainty = AnimoBackend.get().configuration().get(XmlConfiguration.UNCERTAINTY_KEY, null);
		}
		if (uncertainty == null || uncertainty.trim().isEmpty()) {
			uncertainty = "0.0";
		}

		element.setAttribute("xmlns:ANIMO", "ANIMO");
		element.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
		element.setAttribute("secondsPerPoint",
				factoryHelper.readModelValue(model, Model.Properties.SECONDS_PER_POINT, "1.0"));
		element.setAttribute("levels", factoryHelper.readModelValue(model, Model.Properties.NUMBER_OF_LEVELS, "100"));
		element.setAttribute("timeScaleFactor",
				factoryHelper.readModelValue(model, Model.Properties.TIME_SCALE_FACTOR, "1.0"));
		element.setAttribute("uncertainty", uncertainty);

		return this;
	}

	public AnimoMetamodelFactory SetNodes(Model model) {
		List<Reactant> reactants = new ArrayList<Reactant>(model.getReactantCollection());

		for (int index = 0; index < reactants.size(); index++) {
			Reactant reactant = reactants.get(index);

			Element node = document.createElement("nodes");
			node.setAttribute("xsi:type", "ANIMO:Node");
			node.setAttribute("index", String.valueOf(index));
			node.setAttribute("id", factoryHelper.resolveElementId(reactant.getId(),
					factoryHelper.readEntityValue(reactant, Model.Properties.CYTOSCAPE_ID, String.valueOf(index))));
			node.setAttribute("SUID",
					factoryHelper.readEntityValue(reactant, Model.Properties.CYTOSCAPE_ID, String.valueOf(index)));
			node.setAttribute("canonicalName", factoryHelper.readEntityValue(reactant, Model.Properties.CANONICAL_NAME,
					factoryHelper.readEntityValue(reactant, Model.Properties.ALIAS, "Reactant " + index)));
			node.setAttribute("name", factoryHelper.readEntityValue(reactant, Model.Properties.ALIAS,
					factoryHelper.readEntityValue(reactant, Model.Properties.CANONICAL_NAME, "Reactant " + index)));
			node.setAttribute("enabled", factoryHelper.readEntityValue(reactant, Model.Properties.ENABLED, "true"));

			node.setAttribute("initialConcentration",
					factoryHelper.readEntityValue(reactant, Model.Properties.INITIAL_LEVEL, "0"));
			node.setAttribute("levels",
					factoryHelper.readEntityValue(reactant, Model.Properties.NUMBER_OF_LEVELS, "1"));
			node.setAttribute("plotted", factoryHelper.readEntityValue(reactant, Model.Properties.PLOTTED, "true"));
			node.setAttribute("randomInitialConcentration",
					factoryHelper.readEntityValue(reactant, Model.Properties.RANDOM_INITIALIZATION, "false"));
			node.setAttribute("randomInitialConcentrationMinimum",
					factoryHelper.readEntityValue(reactant, Model.Properties.RANDOM_INIT_MIN, "0"));
			node.setAttribute("randomInitialConcentrationMaximum",
					factoryHelper.readEntityValue(reactant, Model.Properties.RANDOM_INIT_MAX, "0"));
			node.setAttribute("randomInitialConcentrationStep",
					factoryHelper.readEntityValue(reactant, Model.Properties.RANDOM_INIT_STEP, "1"));

			element.appendChild(node);
		}

		return this;
	}

	public AnimoMetamodelFactory SetEdges(Model model) {
		List<Reactant> reactants = new ArrayList<Reactant>(model.getReactantCollection());
		List<Reaction> reactions = new ArrayList<Reaction>(model.getReactionCollection());
		Map<String, Integer> reactantToIndex = new HashMap<String, Integer>();

		for (int index = 0; index < reactants.size(); index++) {
			Reactant reactant = reactants.get(index);
			reactantToIndex.put(reactant.getId(), index);
		}

		for (int index = 0; index < reactions.size(); index++) {
			Reaction reaction = reactions.get(index);

			Element edge = document.createElement("edges");
			edge.setAttribute("xsi:type", "ANIMO:Edge");
			edge.setAttribute("index", String.valueOf(index));
			edge.setAttribute("id", factoryHelper.resolveElementId(reaction.getId(),
					factoryHelper.readEntityValue(reaction, Model.Properties.CYTOSCAPE_ID, String.valueOf(index))));
			edge.setAttribute("SUID",
					factoryHelper.readEntityValue(reaction, Model.Properties.CYTOSCAPE_ID, String.valueOf(index)));
			edge.setAttribute("canonicalName", factoryHelper.readEntityValue(reaction, Model.Properties.CANONICAL_NAME,
					factoryHelper.readEntityValue(reaction, Model.Properties.ALIAS, "Reaction " + index)));
			edge.setAttribute("name", factoryHelper.readEntityValue(reaction, Model.Properties.ALIAS,
					factoryHelper.readEntityValue(reaction, Model.Properties.CANONICAL_NAME, "Reaction " + index)));
			edge.setAttribute("enabled", factoryHelper.readEntityValue(reaction, Model.Properties.ENABLED, "true"));

			edge.setAttribute("increment", factoryHelper.readEntityValue(reaction, Model.Properties.INCREMENT, "0"));
			edge.setAttribute("scenario", factoryHelper.readEntityValue(reaction, Model.Properties.SCENARIO, "0"));
			edge.setAttribute("k", factoryHelper.readEntityValue(reaction, Model.Properties.SCENARIO_PARAMETER_K, "0"));
			edge.setAttribute("levelsScaleFactor",
					factoryHelper.readEntityValue(reaction, Model.Properties.LEVELS_SCALE_FACTOR, "1"));

			String catalyst = factoryHelper.readEntityValue(reaction, Model.Properties.CATALYST, null);
			String reactant = factoryHelper.readEntityValue(reaction, Model.Properties.REACTANT, null);
			String outputReactant = factoryHelper.readEntityValue(reaction, Model.Properties.OUTPUT_REACTANT, null);

			Integer sourceIndex = factoryHelper.resolveReactantIndex(reactantToIndex, catalyst,
					factoryHelper.readEntityValue(reaction, Model.Properties.REACTANT_ID_E1, null));
			Integer targetIndex = factoryHelper.resolveReactantIndex(reactantToIndex, outputReactant, reactant,
					factoryHelper.readEntityValue(reaction, Model.Properties.REACTANT_ID_E2, null));

			edge.setAttribute("source", factoryHelper.nodeReference(sourceIndex));
			edge.setAttribute("target", factoryHelper.nodeReference(targetIndex));
			edge.setAttribute("_REACTANT_E1", factoryHelper.nodeReference(sourceIndex));
			edge.setAttribute("_REACTANT_E2", factoryHelper.nodeReference(targetIndex));
			edge.setAttribute("_REACTANT_ACT_E1",
					factoryHelper.readEntityValue(reaction, Model.Properties.REACTANT_IS_ACTIVE_INPUT_E1, "true"));
			edge.setAttribute("_REACTANT_ACT_E2",
					factoryHelper.readEntityValue(reaction, Model.Properties.REACTANT_IS_ACTIVE_INPUT_E2, "false"));

			String customFormula = factoryHelper.readEntityValue(reaction, Scenario3.CUSTOM_FORMULA, "");
			edge.setAttribute("customFormula", customFormula != null ? customFormula : "");

			element.appendChild(edge);
		}

		return this;
	}

	public Path writeToFile() {
		Path outputFile;
		try {
			outputFile = Paths.get(System.getProperty("java.io.tmpdir"), "AnimoCyNetwork" + "_" + UUID.randomUUID().toString() + ".model");
			Files.createDirectories(outputFile.getParent());
			Transformer transformer = TransformerFactory.newInstance().newTransformer();
			transformer.setOutputProperty(OutputKeys.INDENT, "yes");
			transformer.transform(new DOMSource(document), new StreamResult(outputFile.toFile()));
			outputFile.toFile().deleteOnExit();
			return outputFile;
		} catch (TransformerException | RuntimeException ex) {
			throw new IllegalStateException("Could not write ANIMO metamodel file", ex);
		} catch (Exception ex) {
			throw new IllegalStateException("Could not create temporary output file for ANIMO metamodel file", ex);
		}
	}
}
