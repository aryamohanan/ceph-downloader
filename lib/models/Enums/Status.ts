export enum Status {
    red = 500,
    green = 200
}

export enum ServiceTypeName {
    "KORE Canada GSM" = 1,
    "KORE USA GSM (Blue)" = 2,
    "M2MSecurelink" = 3,
    "M2M Virtual ICSMS" = 4,
    "KORE CDMA" = 5,
    "KORE USA GSM (Gold)" = 6,
    "KORE International GSM" = 7,
    "KORE Satellite" = 8,
    "KORE Asia-Pacific" = 9,
    "KORE Australasia" = 11,
    "KORE EE" = 13,
    "KORE BSAT" = 14,
    "KORE Canada GSM 2" = 15,
    "KORE T-USA" = 16,
    "KORE VZW" = 19,
    "KORE T-USA H" = 20,
    "KORE T-USA W" = 21,
    "KORE O2 UK" = 22,
    "KORE Sprint CDMA" = 23,
    "KORE O2 CC" = 24,
    "KORE GN" = 25,
    "KATTCC" = 26,
    "KORE 3IE CC" = 27,
    "KORE Telstra" = 28,
    "KORE ESIM BLUE" = 29,
    "KORE ESIM GREEN" = 30,
    "KORE ESIM RED" = 31,
    "KORE OmniSIM" = 32,
    "KORE SC" = 33,
    "KORE TF CC W" = 34,
    "KORE TF CC R" = 35,
    "KORE VIVO Brazil" = 36,
    "KORE APEX" = 37,
    "KORE Deutsche US" = 38,
    "KORE TELS2" = 39,
    "KORE eConnect" = 40,
    "KORE TELUS CC" = 42
}

export enum TimeZone {
    EASTERN_STANDARD_TIME = "America/New_York",
}

export enum RequestStatus {
    PENDING = 'Pending',
    COMPLETED = 'Completed',
    CANCELLED = 'Cancelled',
    SUBMITTED = "Submitted",
    FAILED = "Failed",
    FULFILLMENT_IN_PROGRESS='Fulfillment In Progress'
  }