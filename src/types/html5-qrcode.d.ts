
declare module 'html5-qrcode' {
  export interface Html5QrcodeConfig {
    fps?: number;
    qrbox?: number | { width: number; height: number };
    aspectRatio?: number;
    disableFlip?: boolean;
    formatsToSupport?: number[];
    experimentalFeatures?: {
      useBarCodeDetectorIfSupported?: boolean;
    };
    rememberLastUsedCamera?: boolean;
    supportedScanTypes?: number[];
    showTorchButtonIfSupported?: boolean;
    showZoomSliderIfSupported?: boolean;
    defaultZoomValueIfSupported?: number;
  }

  export interface CameraDevice {
    id: string;
    label: string;
  }

  export interface TorchCapability {
    isSupported: () => boolean;
    enable: () => Promise<void>;
    disable: () => Promise<void>;
  }

  export interface ZoomCapability {
    isSupported: () => boolean;
    min: () => number;
    max: () => number;
    value: () => number;
    apply: (value: number) => Promise<void>;
  }

  export interface CameraCapabilities {
    torchFeature?: () => TorchCapability;
    zoomFeature?: () => ZoomCapability;
  }

  export enum Html5QrcodeScannerState {
    UNKNOWN = 0,
    NOT_STARTED = 1,
    SCANNING = 2,
    PAUSED = 3,
  }

  export type QrcodeSuccessCallback = (decodedText: string, decodedResult: unknown) => void;
  export type QrcodeErrorCallback = (errorMessage: string, error: unknown) => void;

  export class Html5Qrcode {
    constructor(elementId: string, verbose?: boolean);

    start(
      cameraIdOrConfig: string | { facingMode: string },
      configuration: Html5QrcodeConfig,
      qrCodeSuccessCallback: QrcodeSuccessCallback,
      qrCodeErrorCallback?: QrcodeErrorCallback
    ): Promise<void>;

    stop(): Promise<void>;
    clear(): Promise<void>;
    pause(shouldPauseScan?: boolean): void;
    resume(): void;
    getState(): Html5QrcodeScannerState;
    getRunningTrackCameraCapabilities(): CameraCapabilities;
    getRunningTrackSettings(): MediaTrackSettings;
    applyVideoConstraints(constraints: MediaTrackConstraints): Promise<void>;

    static getCameras(): Promise<CameraDevice[]>;
    static scanFile(imageFile: File, showImage?: boolean): Promise<string>;
    static scanFileV2(imageFile: File, showImage?: boolean): Promise<{
      decodedText: string;
      result: unknown;
    }>;
  }

  export class Html5QrcodeScanner {
    constructor(
      elementId: string,
      config: Html5QrcodeConfig,
      verbose?: boolean
    );

    render(
      qrCodeSuccessCallback: QrcodeSuccessCallback,
      qrCodeErrorCallback?: QrcodeErrorCallback
    ): void;

    clear(): Promise<void>;
    pause(shouldPauseScan?: boolean): void;
    resume(): void;
    getState(): Html5QrcodeScannerState;
  }

  export const Html5QrcodeSupportedFormats: {
    QR_CODE: number;
    AZTEC: number;
    CODABAR: number;
    CODE_39: number;
    CODE_93: number;
    CODE_128: number;
    DATA_MATRIX: number;
    MAXICODE: number;
    ITF: number;
    EAN_13: number;
    EAN_8: number;
    PDF_417: number;
    RSS_14: number;
    RSS_EXPANDED: number;
    UPC_A: number;
    UPC_E: number;
    UPC_EAN_EXTENSION: number;
  };
}

