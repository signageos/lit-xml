import { expect } from 'chai';
import { xml, createLitXml, StrictXmlTemplateLiteral, XmlPrimitive } from '../../src';

describe('LitXml integration', () => {
  it('should sanitize XML', () => {
    expect(xml`<foo>${'</foo>'}</foo>`.toString()).eq('<foo>&lt;/foo&gt;</foo>');
  });

  it('should sanitize "deep" XML', () => {
    expect(xml`<foo>${'</foo>'}${xml`<bar>${'</bar>'}</bar>`}</foo>`.toString()).eq('<foo>&lt;/foo&gt;<bar>&lt;/bar&gt;</bar></foo>');
  });

  it('should format the xml literal', () => {
    const xml = createLitXml({ format: true });
    expect(xml`<baz><foo bar="${true}">${42}</foo></baz>`.toString()).eq('\n<baz>\n  <foo bar="true">\n    42\n  </foo>\n</baz>');
  });

  it('should allow `arr.map` to construct xml documents', () => {
    const people = [{ name: 'foo' }, { name: 'bar' }];
    expect(xml`<people>${people.map((p) => xml`<person>${p.name}</person>`)}</people>`.toString()).eq(
      '<people><person>foo</person><person>bar</person></people>'
    );
  });

  /*
   * Only type-check these tests. Running is not needed
   */
  describe.skip('strictTemplateValues', () => {
    let strictXml: StrictXmlTemplateLiteral;
    beforeEach(() => {
      strictXml = createLitXml({ strictTemplateValues: true });
    });

    it('should allow xml primitives in the template', () => {
      const primitives: XmlPrimitive[] = ['foo', 0, 1, true, false, BigInt(10), strictXml`<foo></foo>`, [strictXml`<foo></foo>`]];
      primitives.forEach((p) => strictXml`<foo>${p}</foo>`);
    });

    it('should not allow non-primitive values in the template', () => {
      const nonPrimitives = [{ foo: 'bar' }, new Date()];
      nonPrimitives.forEach(
        (p) =>
          // @ts-expect-error non-primitives are not allowed
          strictXml`<foo>${p}</foo>`
      );
    });

    it('should not allow null or undefined values in the template', () => {
      const nonPrimitives: (null | undefined)[] = [null, undefined];
      nonPrimitives.forEach(
        (p) =>
          // @ts-expect-error null or undefined are not allowed
          strictXml`<foo>${p}</foo>`
      );
    });

    it('should allow any value when strictTemplateValues is false', () => {
      xml`<foo>${new Date()}</foo>`;
    });
  });
});
