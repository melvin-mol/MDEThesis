/**
 */
package org.muml.uppaal.templates;

import org.muml.uppaal.expressions.Expression;

import org.muml.uppaal.visuals.PlanarElement;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>Invariant</b></em>'.
 * <!-- end-user-doc -->
 *
 * <!-- begin-model-doc -->
 * Wrapper for a location invariant expression with an optional label position.
 * <!-- end-model-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link org.muml.uppaal.templates.Invariant#getExpression <em>Expression</em>}</li>
 * </ul>
 *
 * @see org.muml.uppaal.templates.TemplatesPackage#getInvariant()
 * @model
 * @generated
 */
public interface Invariant extends PlanarElement {
	/**
	 * Returns the value of the '<em><b>Expression</b></em>' containment reference.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * <!-- begin-model-doc -->
	 * The invariant expression.
	 * <!-- end-model-doc -->
	 * @return the value of the '<em>Expression</em>' containment reference.
	 * @see #setExpression(Expression)
	 * @see org.muml.uppaal.templates.TemplatesPackage#getInvariant_Expression()
	 * @model containment="true" required="true"
	 * @generated
	 */
	Expression getExpression();

	/**
	 * Sets the value of the '{@link org.muml.uppaal.templates.Invariant#getExpression <em>Expression</em>}' containment reference.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @param value the new value of the '<em>Expression</em>' containment reference.
	 * @see #getExpression()
	 * @generated
	 */
	void setExpression(Expression value);

} // Invariant
