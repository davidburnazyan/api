import { Service } from 'typedi';
import Group from "../models/group";

@Service()
export class GroupRepository {

    async findLastOne() {
        return await Group.findOne().limit(1).sort({ $natural: -1 })
    }

    async create({ name }: any) {
        return await Group.create({ name })
    }

    async countDocuments() {
        return await Group.countDocuments()
    }

}