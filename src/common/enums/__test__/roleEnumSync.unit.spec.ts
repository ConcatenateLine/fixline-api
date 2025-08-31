import Role from "../role.enum";
import {Role as PrismaRole} from "@prisma/client"

describe('Role enum sync', () => {
    it('should match Prisma enum values', () => {
        expect(Object.values(Role).sort()).toEqual(Object.values(PrismaRole).sort());
    });
});
