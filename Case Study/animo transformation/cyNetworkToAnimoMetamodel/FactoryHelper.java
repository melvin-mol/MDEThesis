package animo.core.analyser.uppaal.mde.cyNetworkToAnimoMetamodel;

import java.util.Map;

import animo.core.model.Model;

public class FactoryHelper {
	public String nodeReference(Integer index) {
		if (index == null) {
			return "";
		}
		return "//@nodes." + index;
	}

	public Integer resolveReactantIndex(Map<String, Integer> reactantToIndex, String... candidates) {
		for (String candidate : candidates) {
			if (candidate != null && reactantToIndex.containsKey(candidate)) {
				return reactantToIndex.get(candidate);
			}
		}
		return null;
	}

	public String readModelValue(Model model, String propertyName, String defaultValue) {
		if (model.getProperties().has(propertyName)) {
			Object value = model.getProperties().get(propertyName).getValue();
			if (value != null) {
				return String.valueOf(value);
			}
		}
		return defaultValue;
	}

	public String readEntityValue(animo.core.model.Entity entity, String propertyName, String defaultValue) {
		if (entity.has(propertyName)) {
			Object value = entity.get(propertyName).getValue();
			if (value != null) {
				return String.valueOf(value);
			}
		}
		return defaultValue;
	}

	public String resolveElementId(String primary, String fallback) {
		String value = firstNonEmpty(primary, fallback, "0");
		String numericOnly = value.replaceAll("[^0-9]", "");
		if (!numericOnly.isEmpty()) {
			return numericOnly;
		}
		return "0";
	}

	public String firstNonEmpty(String... values) {
		for (String value : values) {
			if (value != null && !value.trim().isEmpty()) {
				return value;
			}
		}
		return "";
	}
}
