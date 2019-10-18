import { get, has, isObject, set, unset } from "@arkecosystem/utils";
import { strict } from "assert";

type AttributeIndexKey = number | object | string;

export class AttributeIndex {
    /**
     * @private
     * @type {Record<string | number, unknown>}
     * @memberof AttributeIndex
     */
    private readonly attributes: Record<string | number, unknown> = {};

    /**
     * @private
     * @type {WeakMap<object, unknown>}
     * @memberof AttributeIndex
     */
    private readonly attributesWeak: WeakMap<object, object> = new WeakMap<object, object>();

    /**
     * @private
     * @type {Set<string>}
     * @memberof AttributeIndex
     */
    private readonly knownAttributes: Set<string> = new Set<string>();

    /**
     * @param {string} attribute
     * @returns {boolean}
     * @memberof AttributeIndex
     */
    public bind(attribute: string): boolean {
        if (this.knownAttributes.has(attribute)) {
            return false;
        }

        this.knownAttributes.add(attribute);

        return this.knownAttributes.has(attribute);
    }

    /**
     * @param {string} attribute
     * @returns {boolean}
     * @memberof AttributeIndex
     */
    public unbind(attribute: string): boolean {
        if (!this.knownAttributes.has(attribute)) {
            return false;
        }

        this.knownAttributes.delete(attribute);

        return !this.knownAttributes.has(attribute);
    }

    /**
     * @param {string} attribute
     * @returns {boolean}
     * @memberof AttributeIndex
     */
    public isBound(attribute: string): boolean {
        return this.knownAttributes.has(attribute);
    }

    /**
     * @template T
     * @param {string} id
     * @param {string} attribute
     * @param {T} [defaultValue]
     * @returns {T}
     * @memberof AttributeIndex
     */
    public get<T>(id: AttributeIndexKey, attribute: string, defaultValue?: T): T {
        this.assertKnown(attribute);

        if (isObject(id)) {
            return get(this.attributesWeak.get(id), attribute, defaultValue);
        }

        return get(this.attributes, `${id}.${attribute}`, defaultValue);
    }

    /**
     * @template T
     * @param {string} id
     * @param {string} attribute
     * @param {T} value
     * @returns {boolean}
     * @memberof AttributeIndex
     */
    public set<T>(id: AttributeIndexKey, attribute: string, value: T): boolean {
        this.assertKnown(attribute);

        if (isObject(id)) {
            if (!this.attributesWeak.has(id)) {
                this.attributesWeak.set(id, {});
            }

            set(this.attributesWeak.get(id), attribute, value);
        } else {
            set(this.attributes, `${id}.${attribute}`, value);
        }

        return this.has(id, attribute);
    }

    /**
     * @param {string} id
     * @param {string} attribute
     * @returns {boolean}
     * @memberof AttributeIndex
     */
    public forget(id: AttributeIndexKey, attribute: string): boolean {
        this.assertKnown(attribute);

        if (isObject(id)) {
            return unset(this.attributesWeak.get(id), attribute);
        }

        unset(this.attributes, `${id}.${attribute}`);

        return this.has(id, attribute);
    }

    /**
     * @param {string} id
     * @param {string} attribute
     * @returns {boolean}
     * @memberof AttributeIndex
     */
    public has(id: AttributeIndexKey, attribute: string): boolean {
        this.assertKnown(attribute);

        if (isObject(id)) {
            return has(this.attributesWeak.get(id), attribute);
        }

        return has(this.attributes, `${id}.${attribute}`);
    }

    /**
     * @private
     * @param {string} attribute
     * @memberof AttributeIndex
     */
    private assertKnown(attribute: string): void {
        strict.strictEqual(
            this.knownAttributes.has(attribute),
            true,
            `Tried to access an unknown attribute: ${attribute}`,
        );
    }
}
