import * as path from "path";
import {OptionsConfig, polymerElementOptionsConfig, PolymerElementOptions} from "../../../common/cli-options";
import {blankComponentParams} from "./params";
import {Polymer2ComponentTemplateModel} from "./template-model";
import {BaseGenerator} from "../../../common/generation";
import {StudioTemplateProperty} from "../../../common/cuba-studio";
import {elementNameToClass} from "../../../common/utils";

interface Answers {
  componentName: string
}

export function createPolymer2ComponentGenerator(templateDir = path.join(__dirname, 'template')) {

  return class Polymer2ComponentGenerator extends BaseGenerator<Answers, Polymer2ComponentTemplateModel, PolymerElementOptions> {

    constructor(args: string | string[], options: PolymerElementOptions) {
      super(args, options);
      this.sourceRoot(templateDir);
    }

    // noinspection JSUnusedGlobalSymbols
    async prompting() {
      await this._promptOrParse();
    }

    // noinspection JSUnusedGlobalSymbols
    writing() {
      this.log(`Generating to ${this.destinationPath()}`);
      if (!this.answers) {
        throw new Error('Answers not provided');
      }
      this.model = answersToModel(this.answers, this.options.dirShift);
      this.fs.copyTpl(
        this.templatePath('component.html'),
        this.destinationPath(this.model.componentName + '.html'), this.model
      );
    }

    end() {
      this.log(`Blank component has been successfully generated into ${this.destinationRoot()}`);
    }

    _getParams(): StudioTemplateProperty[] {
      return blankComponentParams;
    }

    _getAvailableOptions(): OptionsConfig {
      return polymerElementOptionsConfig;
    }

  }

}

function answersToModel(answers: Answers, dirShift: string | undefined): Polymer2ComponentTemplateModel {
  return {
    componentName: answers.componentName,
    className: elementNameToClass(answers.componentName),
    relDirShift: dirShift || ''
  }
}

export const generator = createPolymer2ComponentGenerator();
export {
  polymerElementOptionsConfig as options,
  blankComponentParams as params
};