import React from 'react';
import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  ModalProps as ChakraModalProps,
} from '@chakra-ui/react';

export interface ModalProps extends Omit<ChakraModalProps, 'isOpen' | 'onClose'> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
  closeOnOverlayClick?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  closeButtonLabel?: string;
  submitButtonLabel?: string;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  showCloseButton?: boolean;
  showFooter?: boolean;
  children: React.ReactNode;
}

/**
 * A reusable modal component with standard styling and behavior
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  footer,
  closeOnOverlayClick = true,
  size = 'md',
  closeButtonLabel = 'Cancel',
  submitButtonLabel = 'Submit',
  onSubmit,
  isSubmitting = false,
  showCloseButton = true,
  showFooter = true,
  children,
  ...rest
}) => {
  // For accessibility and keyboard navigation
  const initialFocusRef = React.useRef<HTMLButtonElement>(null);

  // Default footer with cancel and submit buttons
  const defaultFooter = (
    <>
      {showCloseButton && (
        <Button 
          variant="ghost" 
          mr={3} 
          onClick={onClose}
          data-testid="modal-cancel-button"
        >
          {closeButtonLabel}
        </Button>
      )}
      {onSubmit && (
        <Button
          colorScheme="purple"
          onClick={onSubmit}
          isLoading={isSubmitting}
          data-testid="modal-submit-button"
          ref={initialFocusRef}
        >
          {submitButtonLabel}
        </Button>
      )}
    </>
  );

  return (
    <ChakraModal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={closeOnOverlayClick}
      size={size}
      initialFocusRef={initialFocusRef}
      {...rest}
    >
      <ModalOverlay />
      <ModalContent data-testid="modal-content">
        {title && (
          <ModalHeader data-testid="modal-header">{title}</ModalHeader>
        )}
        <ModalCloseButton data-testid="modal-close-button" />
        <ModalBody data-testid="modal-body">
          {children}
        </ModalBody>

        {showFooter && (
          <ModalFooter data-testid="modal-footer">
            {footer || defaultFooter}
          </ModalFooter>
        )}
      </ModalContent>
    </ChakraModal>
  );
};

export default Modal; 