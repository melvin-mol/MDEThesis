/**
 */
package nl.utwente.ewi.fmt.uppaalSMC.impl;

import nl.utwente.ewi.fmt.uppaalSMC.ChanceEdge;
import nl.utwente.ewi.fmt.uppaalSMC.UppaalSMCPackage;

import org.eclipse.emf.common.notify.Notification;
import org.eclipse.emf.common.notify.NotificationChain;

import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.InternalEObject;

import org.eclipse.emf.ecore.impl.ENotificationImpl;

import org.muml.uppaal.templates.impl.EdgeImpl;
import org.muml.uppaal.visuals.Point;

/**
 * <!-- begin-user-doc -->
 * An implementation of the model object '<em><b>Chance Edge</b></em>'.
 * <!-- end-user-doc -->
 * <p>
 * The following features are implemented:
 * </p>
 * <ul>
 *   <li>{@link nl.utwente.ewi.fmt.uppaalSMC.impl.ChanceEdgeImpl#getWeight <em>Weight</em>}</li>
 *   <li>{@link nl.utwente.ewi.fmt.uppaalSMC.impl.ChanceEdgeImpl#getProbabilityPosition <em>Probability Position</em>}</li>
 * </ul>
 *
 * @generated
 */
public class ChanceEdgeImpl extends EdgeImpl implements ChanceEdge {
	/**
	 * The default value of the '{@link #getWeight() <em>Weight</em>}' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getWeight()
	 * @generated
	 * @ordered
	 */
	protected static final int WEIGHT_EDEFAULT = 0;

	/**
	 * The cached value of the '{@link #getWeight() <em>Weight</em>}' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getWeight()
	 * @generated
	 * @ordered
	 */
	protected int weight = WEIGHT_EDEFAULT;

	/**
	 * The cached value of the '{@link #getProbabilityPosition() <em>Probability Position</em>}' containment reference.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getProbabilityPosition()
	 * @generated
	 * @ordered
	 */
	protected Point probabilityPosition;

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	protected ChanceEdgeImpl() {
		super();
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	protected EClass eStaticClass() {
		return UppaalSMCPackage.Literals.CHANCE_EDGE;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public int getWeight() {
		return weight;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public void setWeight(int newWeight) {
		int oldWeight = weight;
		weight = newWeight;
		if (eNotificationRequired())
			eNotify(new ENotificationImpl(this, Notification.SET, UppaalSMCPackage.CHANCE_EDGE__WEIGHT, oldWeight, weight));
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public Point getProbabilityPosition() {
		return probabilityPosition;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public NotificationChain basicSetProbabilityPosition(Point newProbabilityPosition, NotificationChain msgs) {
		Point oldProbabilityPosition = probabilityPosition;
		probabilityPosition = newProbabilityPosition;
		if (eNotificationRequired()) {
			ENotificationImpl notification = new ENotificationImpl(this, Notification.SET, UppaalSMCPackage.CHANCE_EDGE__PROBABILITY_POSITION, oldProbabilityPosition, newProbabilityPosition);
			if (msgs == null) msgs = notification; else msgs.add(notification);
		}
		return msgs;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public void setProbabilityPosition(Point newProbabilityPosition) {
		if (newProbabilityPosition != probabilityPosition) {
			NotificationChain msgs = null;
			if (probabilityPosition != null)
				msgs = ((InternalEObject)probabilityPosition).eInverseRemove(this, EOPPOSITE_FEATURE_BASE - UppaalSMCPackage.CHANCE_EDGE__PROBABILITY_POSITION, null, msgs);
			if (newProbabilityPosition != null)
				msgs = ((InternalEObject)newProbabilityPosition).eInverseAdd(this, EOPPOSITE_FEATURE_BASE - UppaalSMCPackage.CHANCE_EDGE__PROBABILITY_POSITION, null, msgs);
			msgs = basicSetProbabilityPosition(newProbabilityPosition, msgs);
			if (msgs != null) msgs.dispatch();
		}
		else if (eNotificationRequired())
			eNotify(new ENotificationImpl(this, Notification.SET, UppaalSMCPackage.CHANCE_EDGE__PROBABILITY_POSITION, newProbabilityPosition, newProbabilityPosition));
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public NotificationChain eInverseRemove(InternalEObject otherEnd, int featureID, NotificationChain msgs) {
		switch (featureID) {
			case UppaalSMCPackage.CHANCE_EDGE__PROBABILITY_POSITION:
				return basicSetProbabilityPosition(null, msgs);
		}
		return super.eInverseRemove(otherEnd, featureID, msgs);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public Object eGet(int featureID, boolean resolve, boolean coreType) {
		switch (featureID) {
			case UppaalSMCPackage.CHANCE_EDGE__WEIGHT:
				return getWeight();
			case UppaalSMCPackage.CHANCE_EDGE__PROBABILITY_POSITION:
				return getProbabilityPosition();
		}
		return super.eGet(featureID, resolve, coreType);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public void eSet(int featureID, Object newValue) {
		switch (featureID) {
			case UppaalSMCPackage.CHANCE_EDGE__WEIGHT:
				setWeight((Integer)newValue);
				return;
			case UppaalSMCPackage.CHANCE_EDGE__PROBABILITY_POSITION:
				setProbabilityPosition((Point)newValue);
				return;
		}
		super.eSet(featureID, newValue);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public void eUnset(int featureID) {
		switch (featureID) {
			case UppaalSMCPackage.CHANCE_EDGE__WEIGHT:
				setWeight(WEIGHT_EDEFAULT);
				return;
			case UppaalSMCPackage.CHANCE_EDGE__PROBABILITY_POSITION:
				setProbabilityPosition((Point)null);
				return;
		}
		super.eUnset(featureID);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public boolean eIsSet(int featureID) {
		switch (featureID) {
			case UppaalSMCPackage.CHANCE_EDGE__WEIGHT:
				return weight != WEIGHT_EDEFAULT;
			case UppaalSMCPackage.CHANCE_EDGE__PROBABILITY_POSITION:
				return probabilityPosition != null;
		}
		return super.eIsSet(featureID);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public String toString() {
		if (eIsProxy()) return super.toString();

		StringBuffer result = new StringBuffer(super.toString());
		result.append(" (weight: ");
		result.append(weight);
		result.append(')');
		return result.toString();
	}

} //ChanceEdgeImpl
