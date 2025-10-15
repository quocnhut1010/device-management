// Export all replacement components
export { default as SelectReplacementDeviceDialog } from './SelectReplacementDeviceDialog';
export { default as ReplacementHistoryList } from './ReplacementHistoryList';
export { default as ReplacementDetailsDialog } from './ReplacementDetailsDialog';
export { default as ReplacementButton } from './ReplacementButton';
export { default as DeviceReplacementDialog } from './DeviceReplacementDialog';

// Export types for convenience
export type { 
  ReplacementDto, 
  CreateReplacementDto, 
  SuggestedDeviceDto, 
  ReplacementFormData,
  ReplacementFilters 
} from '../../types/replacement';