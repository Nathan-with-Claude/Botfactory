/**
 * Mock de react-native-signature-canvas pour les tests Jest (US-046).
 *
 * Ce mock reproduit l'API publique du composant SignatureCanvas :
 *   - ref avec clearSignature() et readSignature()
 *   - onOK   : callback appelé avec la chaîne base64 PNG
 *   - onEmpty : callback appelé quand le pad est vide
 *   - onBegin : callback appelé au début du trace
 *
 * Les tests Jest déclenchent les callbacks via fireEvent ou via des helpers
 * exposés sur l'element (props.onOK, props.onEmpty).
 */

import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

interface SignatureCanvasProps {
  ref?: React.Ref<SignatureCanvasRef>;
  onOK?: (base64: string) => void;
  onEmpty?: () => void;
  onBegin?: () => void;
  style?: object;
  webStyle?: string;
  descriptionText?: string;
  clearText?: string;
  confirmText?: string;
  autoClear?: boolean;
  imageType?: string;
}

export interface SignatureCanvasRef {
  clearSignature: () => void;
  readSignature: () => void;
}

// Alias pour correspondre au type exporté par la vraie librairie
export type SignatureViewRef = SignatureCanvasRef;

/**
 * Composant simulé — expose les testIDs pour permettre aux tests de :
 *   - simuler un trace : fireEvent(getByTestId('mock-signature-pad'), 'onBegin')
 *   - simuler onOK (trace capturé) : appel direct de props.onOK
 *   - simuler onEmpty : appel direct de props.onEmpty
 */
const MockSignatureCanvas = React.forwardRef<SignatureCanvasRef, SignatureCanvasProps>(
  (props, ref) => {
    React.useImperativeHandle(ref, () => ({
      clearSignature: () => {
        props.onEmpty?.();
      },
      readSignature: () => {
        // Simule l'extraction base64 — appelle onOK avec une valeur factice
        props.onOK?.('data:image/png;base64,MOCK_BASE64_SIGNATURE');
      },
    }));

    return (
      <View testID="mock-signature-pad">
        {/* Bouton pour simuler un tracé dans les tests */}
        <TouchableOpacity
          testID="mock-signature-pad-draw"
          onPress={() => {
            props.onBegin?.();
          }}
          accessible
          accessibilityLabel="Zone de signature (mock)"
        >
          <Text>Zone de signature</Text>
        </TouchableOpacity>
      </View>
    );
  }
);

MockSignatureCanvas.displayName = 'MockSignatureCanvas';

export default MockSignatureCanvas;
