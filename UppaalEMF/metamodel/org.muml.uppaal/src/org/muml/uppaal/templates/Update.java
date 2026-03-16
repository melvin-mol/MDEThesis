/**
 */
package org.muml.uppaal.templates;

import org.eclipse.emf.common.util.EList;
import org.muml.uppaal.expressions.Expression;
import org.muml.uppaal.visuals.PlanarElement;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>Update</b></em>'.
 * <!-- end-user-doc -->
 *
 * <!-- begin-model-doc -->
 * Wrapper for an edge update expression with an optional label position.
 * <!-- end-model-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link org.muml.uppaal.templates.Update#getExpression <em>Expression</em>}</li>
 * </ul>
 *
 * @see org.muml.uppaal.templates.TemplatesPackage#getUpdate()
 * @model
 * @generated
 */
public interface Update extends PlanarElement {
	/**
	 * Returns the value of the '<em><b>Expression</b></em>' containment reference list.
	 * The list contents are of type {@link org.muml.uppaal.expressions.Expression}.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * <!-- begin-model-doc -->
	 * The update expressions rendered in the assignment label.
	 * <!-- end-model-doc -->
	 * @return the value of the '<em>Expression</em>' containment reference list.
	 * @see org.muml.uppaal.templates.TemplatesPackage#getUpdate_Expression()
	 * @model containment="true" required="true"
	 * @generated
	 */
	EList<Expression> getExpression();

} // Update
