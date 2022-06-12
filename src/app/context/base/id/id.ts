// Abstract id type for entity
export interface id {
    value: () => string | undefined;
}
