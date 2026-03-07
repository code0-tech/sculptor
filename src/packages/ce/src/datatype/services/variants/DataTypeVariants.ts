import {DataTypeNodeVariant} from "./DataTypeNodeVariant";

import {DataTypeVariant} from "@code0-tech/sagittarius-graphql-types";
import {DataTypeVariant as DTVariant} from "./DataTypeVariant";

export const VariantsMap = new Map<DataTypeVariant, DTVariant>([
    ["NODE" as DataTypeVariant.Node, DataTypeNodeVariant],

])