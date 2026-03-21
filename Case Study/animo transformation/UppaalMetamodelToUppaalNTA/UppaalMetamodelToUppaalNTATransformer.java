package animo.core.analyser.uppaal.mde.UppaalMetamodelToUppaalNTA;

import java.io.IOException;
import java.nio.file.Path;
import java.util.Collections;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;

import nl.utwente.ewi.fmt.uppaalSMC.NSTA;
import nl.utwente.ewi.fmt.uppaalSMC.Serialization;
import nl.utwente.ewi.fmt.uppaalSMC.UppaalSMCPackage;

public class UppaalMetamodelToUppaalNTATransformer {
	public String transform(Path input) {
		org.xml.sax.helpers.DefaultHandler.class.getName();
		org.xml.sax.ext.LexicalHandler.class.getName();
		javax.xml.datatype.XMLGregorianCalendar.class.getName();

		String result = null;

		ResourceSet rss = new org.eclipse.emf.ecore.resource.impl.ResourceSetImpl();
		rss.getResourceFactoryRegistry().getExtensionToFactoryMap().put(".xml",
				new org.eclipse.emf.ecore.xmi.impl.XMIResourceFactoryImpl());
		rss.getPackageRegistry().put(UppaalSMCPackage.eNS_PREFIX, UppaalSMCPackage.eINSTANCE);

		Resource res = new org.eclipse.emf.ecore.xmi.impl.XMIResourceFactoryImpl()
				.createResource(URI.createFileURI(input.toString()));
		try {
			res.load(Collections.EMPTY_MAP);
		} catch (IOException e) {
			e.printStackTrace();
		}

		EObject content = res.getContents().get(0);
		if (content instanceof NSTA) {
			result = new Serialization().main((NSTA) content).toString();
		} else {
			throw new IllegalArgumentException("Input model is not in proper Uppaal metamodel format");
		}

		return result;
	}
}
